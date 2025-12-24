-- Risk events privacy hardening and activity tracking

-- 1) Enum de severidade
DO $$
BEGIN
  CREATE TYPE public.risk_severity AS ENUM ('low','medium','high','critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Enum de fonte
DO $$
BEGIN
  CREATE TYPE public.risk_source AS ENUM ('panic_button','chat_detection');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3) Vínculo profissional-paciente
-- A base atual utiliza patient_professionals. Mantemos a estrutura existente e garantimos unicidade.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'patient_professionals'
  ) THEN
    -- Garantir colunas essenciais
    ALTER TABLE public.patient_professionals
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

    CREATE UNIQUE INDEX IF NOT EXISTS patient_professionals_unique_link
      ON public.patient_professionals (patient_id, professional_id);

    CREATE INDEX IF NOT EXISTS patient_professionals_created_idx
      ON public.patient_professionals (created_at DESC);
  ELSE
    CREATE TABLE IF NOT EXISTS public.patient_professional_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL,
      professional_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(patient_id, professional_id)
    );
  END IF;
END $$;

-- 4) Eventos de risco (ajuste da tabela existente)
CREATE TABLE IF NOT EXISTS public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source public.risk_source NOT NULL,
  severity public.risk_severity NOT NULL,
  signal TEXT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  professional_visible BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.risk_events
  ALTER COLUMN source TYPE public.risk_source USING source::text::public.risk_source,
  ALTER COLUMN severity TYPE public.risk_severity USING severity::text::public.risk_severity;

ALTER TABLE public.risk_events
  ADD COLUMN IF NOT EXISTS signal TEXT,
  ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.risk_events
  ALTER COLUMN meta SET DEFAULT '{}'::jsonb;

ALTER TABLE public.risk_events
  DROP COLUMN IF EXISTS context;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_event_source') THEN
    DROP TYPE risk_event_source;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_event_severity') THEN
    DROP TYPE risk_event_severity;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS risk_events_patient_created_idx
  ON public.risk_events (patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS risk_events_patient_source_idx
  ON public.risk_events (patient_id, source);

CREATE INDEX IF NOT EXISTS risk_events_patient_severity_idx
  ON public.risk_events (patient_id, severity);

-- Funções helpers
CREATE OR REPLACE FUNCTION public.is_professional(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = uid
      AND LOWER(p.role) = 'professional'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_linked_professional(uid uuid, pid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_professionals l
    WHERE l.professional_id = uid
      AND l.patient_id = pid
      AND (l.status IS NULL OR l.status = 'active')
  );
$$;

-- RLS para vínculos (caso tabela espelho exista)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'patient_professional_links'
  ) THEN
    ALTER TABLE public.patient_professional_links ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "links_select_patient_or_prof" ON public.patient_professional_links;
    CREATE POLICY "links_select_patient_or_prof"
    ON public.patient_professional_links FOR SELECT
    USING (
      patient_id = auth.uid()
      OR professional_id = auth.uid()
    );
  END IF;
END $$;

-- Garantir RLS ativa na tabela legada
ALTER TABLE public.patient_professionals ENABLE ROW LEVEL SECURITY;

-- 5) Políticas risk_events
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "risk_insert_patient" ON public.risk_events;
CREATE POLICY "risk_insert_patient"
ON public.risk_events FOR INSERT
WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "risk_select_patient" ON public.risk_events;
CREATE POLICY "risk_select_patient"
ON public.risk_events FOR SELECT
USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "risk_select_professional_linked" ON public.risk_events;
CREATE POLICY "risk_select_professional_linked"
ON public.risk_events FOR SELECT
USING (
  public.is_professional(auth.uid())
  AND public.is_linked_professional(auth.uid(), patient_id)
  AND professional_visible = TRUE
);

REVOKE UPDATE, DELETE ON public.risk_events FROM anon, authenticated;

-- 6) RPC para agregação
CREATE OR REPLACE FUNCTION public.get_risk_summary(pid uuid, days int DEFAULT 30)
RETURNS TABLE (
  day date,
  panic_count int,
  detection_count int,
  high_critical_count int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    (date_trunc('day', re.created_at))::date AS day,
    COUNT(*) FILTER (WHERE re.source = 'panic_button')::int AS panic_count,
    COUNT(*) FILTER (WHERE re.source = 'chat_detection')::int AS detection_count,
    COUNT(*) FILTER (WHERE re.severity IN ('high','critical'))::int AS high_critical_count
  FROM public.risk_events re
  WHERE re.patient_id = pid
    AND re.created_at >= now() - (GREATEST(days, 1) || ' days')::interval
    AND re.professional_visible = TRUE
  GROUP BY 1
  ORDER BY 1 ASC;
$$;

REVOKE ALL ON FUNCTION public.get_risk_summary(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_risk_summary(uuid, int) TO authenticated;

-- 7) user_activity_events
CREATE TABLE IF NOT EXISTS public.user_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS user_activity_events_user_created_idx
  ON public.user_activity_events (user_id, created_at DESC);

ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_insert_own" ON public.user_activity_events;
CREATE POLICY "events_insert_own"
ON public.user_activity_events FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "events_select_own" ON public.user_activity_events;
CREATE POLICY "events_select_own"
ON public.user_activity_events FOR SELECT
USING (user_id = auth.uid());

REVOKE UPDATE, DELETE ON public.user_activity_events FROM anon, authenticated;

-- 8) Zerar métricas fictícias conhecidas (caso existam colunas legadas)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_stats'
  ) THEN
    EXECUTE 'UPDATE public.user_stats SET chats_count = 0, voice_calls_count = 0, exercises_count = 0, streak_days = 0';
  END IF;
END $$;
