-- Risk events capture panic button presses and automatic detections without storing conversation text
DO $$ BEGIN
  CREATE TYPE risk_event_source AS ENUM ('panic_button', 'chat_detection');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_event_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source risk_event_source NOT NULL,
  severity risk_event_severity NOT NULL,
  context JSONB,
  professional_visible BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_risk_events_patient_created_at ON risk_events(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_events_source ON risk_events(source);
CREATE INDEX IF NOT EXISTS idx_risk_events_severity ON risk_events(severity);

CREATE TABLE IF NOT EXISTS risk_event_daily_agg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_date DATE NOT NULL,
  panic_count INTEGER NOT NULL DEFAULT 0,
  detection_count INTEGER NOT NULL DEFAULT 0,
  high_critical_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_event_daily_unique ON risk_event_daily_agg(patient_id, risk_date);
CREATE INDEX IF NOT EXISTS idx_risk_event_daily_date ON risk_event_daily_agg(risk_date);

ALTER TABLE risk_event_daily_agg
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_event_daily_agg ENABLE ROW LEVEL SECURITY;

-- Patients can insert and view their own events
DROP POLICY IF EXISTS "Patients insert own panic events" ON risk_events;
CREATE POLICY "Patients insert own panic events" ON risk_events
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Patients view own risk events" ON risk_events;
CREATE POLICY "Patients view own risk events" ON risk_events
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Professionals linked to the patient (active) can read risk events but not context sensitive fields
DROP POLICY IF EXISTS "Professionals view linked risk events" ON risk_events;
CREATE POLICY "Professionals view linked risk events" ON risk_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM patient_professionals pp
      WHERE pp.patient_id = risk_events.patient_id
        AND pp.professional_id = auth.uid()
        AND pp.status = 'active'
    )
  );

DROP POLICY IF EXISTS "System updates risk daily agg" ON risk_event_daily_agg;
CREATE POLICY "System updates risk daily agg" ON risk_event_daily_agg
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Professionals read aggregated risk" ON risk_event_daily_agg;
CREATE POLICY "Professionals read aggregated risk" ON risk_event_daily_agg
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM patient_professionals pp
      WHERE pp.patient_id = risk_event_daily_agg.patient_id
        AND pp.professional_id = auth.uid()
        AND pp.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Patients read aggregated risk" ON risk_event_daily_agg;
CREATE POLICY "Patients read aggregated risk" ON risk_event_daily_agg
  FOR SELECT
  USING (auth.uid() = patient_id);
