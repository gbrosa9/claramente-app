-- Criação da tabela de conversas para o Supabase
-- Execute este SQL no Dashboard do Supabase > SQL Editor

-- Tabela principal de conversas
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);

-- RLS (Row Level Security) para segurança
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver suas próprias conversas
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = user_id);

-- Política: usuários só podem inserir conversas para eles mesmos
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Política: usuários só podem atualizar suas próprias conversas
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Política: usuários só podem deletar suas próprias conversas
CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid()::text = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Opcional: Tabela para armazenar avaliações das conversas
CREATE TABLE conversation_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para a tabela de avaliações
CREATE INDEX idx_conversation_ratings_conversation_id ON conversation_ratings(conversation_id);
CREATE INDEX idx_conversation_ratings_user_id ON conversation_ratings(user_id);

-- RLS para avaliações
ALTER TABLE conversation_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ratings" ON conversation_ratings
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own ratings" ON conversation_ratings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own ratings" ON conversation_ratings
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own ratings" ON conversation_ratings
  FOR DELETE USING (auth.uid()::text = user_id);