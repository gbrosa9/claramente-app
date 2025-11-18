-- Migration para adicionar coluna role à tabela profiles
-- Esta coluna é necessária para distinguir entre pacientes (user) e profissionais (professional)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'professional', 'admin'));

-- Criar índice para melhorar performance de queries por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Comentário para documentar a coluna
COMMENT ON COLUMN profiles.role IS 'Tipo de usuário: user (paciente), professional (profissional de saúde), admin (administrador)';

-- Atualizar usuários existentes para ter role 'user' por padrão
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;
