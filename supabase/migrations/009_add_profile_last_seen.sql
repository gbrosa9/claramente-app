-- Adiciona colunas de atividade para perfis de usuários
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN profiles.last_seen_at IS 'Último momento em que o usuário foi visto ativo no aplicativo.';
