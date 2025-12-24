-- Direct chat between patients and professionals

CREATE TABLE IF NOT EXISTS patient_professional_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (patient_id, professional_id)
);

CREATE TABLE IF NOT EXISTS patient_professional_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES patient_professional_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'professional')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pp_chats_patient ON patient_professional_chats(patient_id);
CREATE INDEX IF NOT EXISTS idx_pp_chats_professional ON patient_professional_chats(professional_id);
CREATE INDEX IF NOT EXISTS idx_pp_chat_messages_chat ON patient_professional_chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_pp_chat_messages_created_at ON patient_professional_chat_messages(created_at);

ALTER TABLE patient_professional_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_professional_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view direct chats" ON patient_professional_chats;
CREATE POLICY "Participants can view direct chats" ON patient_professional_chats
  FOR SELECT USING (auth.uid()::uuid = patient_id OR auth.uid()::uuid = professional_id);

DROP POLICY IF EXISTS "Participants can insert direct chats" ON patient_professional_chats;
CREATE POLICY "Participants can insert direct chats" ON patient_professional_chats
  FOR INSERT WITH CHECK (auth.uid()::uuid = patient_id OR auth.uid()::uuid = professional_id);

DROP POLICY IF EXISTS "Participants can update direct chats" ON patient_professional_chats;
CREATE POLICY "Participants can update direct chats" ON patient_professional_chats
  FOR UPDATE USING (auth.uid()::uuid = patient_id OR auth.uid()::uuid = professional_id);

DROP POLICY IF EXISTS "Participants can delete direct chats" ON patient_professional_chats;
CREATE POLICY "Participants can delete direct chats" ON patient_professional_chats
  FOR DELETE USING (auth.uid()::uuid = patient_id OR auth.uid()::uuid = professional_id);

DROP POLICY IF EXISTS "Participants can view direct messages" ON patient_professional_chat_messages;
CREATE POLICY "Participants can view direct messages" ON patient_professional_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM patient_professional_chats c
      WHERE c.id = chat_id
        AND (c.patient_id = auth.uid()::uuid OR c.professional_id = auth.uid()::uuid)
    )
  );

DROP POLICY IF EXISTS "Participants can insert direct messages" ON patient_professional_chat_messages;
CREATE POLICY "Participants can insert direct messages" ON patient_professional_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM patient_professional_chats c
      WHERE c.id = chat_id
        AND (
          (c.patient_id = auth.uid()::uuid AND sender_role = 'patient' AND sender_id = auth.uid()::uuid)
          OR (c.professional_id = auth.uid()::uuid AND sender_role = 'professional' AND sender_id = auth.uid()::uuid)
        )
    )
  );

DROP POLICY IF EXISTS "Participants can update direct messages" ON patient_professional_chat_messages;
CREATE POLICY "Participants can update direct messages" ON patient_professional_chat_messages
  FOR UPDATE USING (
    sender_id = auth.uid()::uuid
  ) WITH CHECK (
    sender_id = auth.uid()::uuid
  );

DROP POLICY IF EXISTS "Participants can delete direct messages" ON patient_professional_chat_messages;
CREATE POLICY "Participants can delete direct messages" ON patient_professional_chat_messages
  FOR DELETE USING (
    sender_id = auth.uid()::uuid
  );

DROP TRIGGER IF EXISTS update_pp_chats_updated_at ON patient_professional_chats;
CREATE TRIGGER update_pp_chats_updated_at
  BEFORE UPDATE ON patient_professional_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
