-- Adicionar coluna description à tabela subscription_plans se não existir
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS description TEXT;

-- Atualizar os planos existentes com descrições
UPDATE subscription_plans SET description = 'Perfeito para explorar' WHERE id = 'gratuito';
UPDATE subscription_plans SET description = 'Para uso regular' WHERE id = 'pro';
UPDATE subscription_plans SET description = 'Máximo bem-estar' WHERE id = 'premium';