-- ========================================
-- DIAGNÓSTICO E CORREÇÃO - EXECUTE NO SUPABASE
-- ========================================

-- 1. VERIFICAR se há múltiplos profiles para o mesmo usuário
SELECT id, full_name, email, created_at, COUNT(*) as count
FROM profiles
WHERE id = '2ccbbf21-8d33-487a-841d-e478d26ee96d'
GROUP BY id, full_name, email, created_at;

-- 2. VERIFICAR se o usuário existe na tabela auth.users
SELECT id, email, created_at
FROM auth.users
WHERE id = '2ccbbf21-8d33-487a-841d-e478d26ee96d';

-- 3. SE NÃO HOUVER PROFILE, criar um:
INSERT INTO profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  email,
  'user',
  created_at,
  NOW()
FROM auth.users
WHERE id = '2ccbbf21-8d33-487a-841d-e478d26ee96d'
ON CONFLICT (id) DO UPDATE
SET 
  role = COALESCE(profiles.role, 'user'),
  updated_at = NOW();

-- 4. VERIFICAR se agora está correto
SELECT id, full_name, email, role, created_at
FROM profiles
WHERE id = '2ccbbf21-8d33-487a-841d-e478d26ee96d';

-- 5. CRIAR TRIGGER para auto-criar profile quando usuário se registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. CRIAR profiles para TODOS os usuários que não têm
INSERT INTO profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  u.email,
  'user',
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
