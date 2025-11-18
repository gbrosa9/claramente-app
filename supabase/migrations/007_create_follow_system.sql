-- Migration para sistema de códigos de acompanhamento
-- Cria tabelas para vincular pacientes e profissionais

-- Tabela de códigos de acompanhamento
CREATE TABLE IF NOT EXISTS follow_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de vínculos paciente-profissional
CREATE TABLE IF NOT EXISTS patient_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(patient_id, professional_id)
);

-- Tabela de notificações para profissionais
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_follow_codes_code ON follow_codes(code);
CREATE INDEX IF NOT EXISTS idx_follow_codes_patient_id ON follow_codes(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_codes_expires_at ON follow_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_patient_professionals_patient ON patient_professionals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_professionals_professional ON patient_professionals(professional_id);
CREATE INDEX IF NOT EXISTS idx_notifications_professional ON notifications(professional_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- RLS Policies
ALTER TABLE follow_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Pacientes podem criar seus próprios códigos
CREATE POLICY "Pacientes podem criar códigos"
ON follow_codes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

-- Policy: Pacientes podem ver seus próprios códigos
CREATE POLICY "Pacientes podem ver seus códigos"
ON follow_codes FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- Policy: Profissionais podem resgatar códigos
CREATE POLICY "Profissionais podem resgatar códigos"
ON follow_codes FOR UPDATE
TO authenticated
USING (used_by IS NULL OR auth.uid() = used_by);

-- Policy: Pacientes podem ver seus profissionais
CREATE POLICY "Pacientes podem ver seus profissionais"
ON patient_professionals FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- Policy: Profissionais podem ver seus pacientes
CREATE POLICY "Profissionais podem ver seus pacientes"
ON patient_professionals FOR SELECT
TO authenticated
USING (auth.uid() = professional_id);

-- Policy: Profissionais podem criar vínculos
CREATE POLICY "Profissionais podem criar vínculos"
ON patient_professionals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = professional_id);

-- Policy: Pacientes podem remover profissionais
CREATE POLICY "Pacientes podem remover profissionais"
ON patient_professionals FOR DELETE
TO authenticated
USING (auth.uid() = patient_id);

-- Policy: Profissionais podem ver suas notificações
CREATE POLICY "Profissionais podem ver notificações"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = professional_id);

-- Policy: Profissionais podem atualizar notificações
CREATE POLICY "Profissionais podem atualizar notificações"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = professional_id);

-- Function: Criar notificação quando profissional é vinculado
CREATE OR REPLACE FUNCTION notify_new_link()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (professional_id, patient_id, type, message)
  VALUES (
    NEW.professional_id,
    NEW.patient_id,
    'new_patient',
    'Novo paciente vinculado'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Notificar profissional quando vínculo é criado
DROP TRIGGER IF EXISTS on_patient_professional_created ON patient_professionals;
CREATE TRIGGER on_patient_professional_created
  AFTER INSERT ON patient_professionals
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_link();

-- Comentários para documentação
COMMENT ON TABLE follow_codes IS 'Códigos de acompanhamento gerados por pacientes para profissionais';
COMMENT ON TABLE patient_professionals IS 'Vínculos entre pacientes e profissionais de saúde';
COMMENT ON TABLE notifications IS 'Notificações para profissionais sobre novos pacientes';
