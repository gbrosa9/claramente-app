-- Inserir dados dos planos de assinatura

-- Deletar planos existentes para evitar duplicatas
DELETE FROM subscription_plans;

-- Inserir planos com descrições
INSERT INTO subscription_plans (id, name, description, price, period, features, is_active) VALUES 
(
  'gratuito',
  'Gratuito',
  'Perfeito para explorar e começar sua jornada de bem-estar',
  0.00,
  'month',
  '[
    "Acesso básico aos exercícios", 
    "3 sessões de chat por dia", 
    "Relatórios básicos de progresso", 
    "Exercícios de respiração fundamentais"
  ]'::jsonb,
  true
),
(
  'pro',
  'Pro',
  'Para uso regular com recursos avançados e suporte prioritário',
  29.90,
  'month',
  '[
    "Acesso completo aos exercícios", 
    "Chat ilimitado com IA", 
    "Relatórios detalhados de progresso", 
    "Exercícios personalizados", 
    "Notificações inteligentes", 
    "Suporte prioritário"
  ]'::jsonb,
  true
),
(
  'premium',
  'Premium',
  'Máximo bem-estar com recursos exclusivos e acompanhamento personalizado',
  99.90,
  'month',
  '[
    "Todos os recursos Pro", 
    "Sessões 1:1 com especialistas", 
    "Planos personalizados avançados", 
    "Análise de padrões comportamentais", 
    "Integração com wearables", 
    "Conteúdo exclusivo",
    "Suporte 24/7"
  ]'::jsonb,
  true
);