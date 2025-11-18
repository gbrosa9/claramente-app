-- Migration para adicionar campos à tabela profiles
-- Adicionar colunas que podem estar faltando na tabela profiles

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Comentários para documentar as colunas
COMMENT ON COLUMN profiles.phone IS 'Telefone do usuário';
COMMENT ON COLUMN profiles.date_of_birth IS 'Data de nascimento do usuário';
COMMENT ON COLUMN profiles.location IS 'Localização/endereço do usuário';
COMMENT ON COLUMN profiles.bio IS 'Biografia/descrição do usuário';