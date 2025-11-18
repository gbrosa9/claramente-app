-- ========================================
-- EXECUTE ESTE SCRIPT NO PAINEL DO SUPABASE
-- ========================================
-- 1. Vá para: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor"
-- 4. Cole e execute este script
-- ========================================

-- Adicionar coluna role à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'professional', 'admin'));

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Atualizar usuários existentes
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Verificar se funcionou (deve mostrar a coluna role)
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role';
