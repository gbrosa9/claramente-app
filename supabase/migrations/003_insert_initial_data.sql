-- Inserir dados iniciais nas tabelas

-- Inserir exercícios básicos
INSERT INTO exercises (id, title, description, duration, difficulty, category, instructions) VALUES
('box-breathing', 'Respiração 4-4-4-4', 'Técnica clássica de respiração caixa para acalmar o sistema nervoso', 5, 'Iniciante', 'Respiração', '{"steps": ["Inspire por 4 segundos", "Segure por 4 segundos", "Expire por 4 segundos", "Segure por 4 segundos", "Repita o ciclo"]}'),
('progressive-relaxation', 'Relaxamento Progressivo', 'Tense e solte grupos musculares para reduzir tensão', 10, 'Intermediário', 'Ansiedade', '{"steps": ["Comece pelos pés", "Contraia por 5 segundos", "Relaxe por 10 segundos", "Suba para as panturrilhas", "Continue até a cabeça"]}'),
('4-7-8-breathing', 'Respiração 4-7-8', 'Técnica avançada para ansiedade e insônia', 8, 'Avançado', 'Respiração', '{"steps": ["Inspire por 4 segundos", "Segure por 7 segundos", "Expire por 8 segundos", "Repita 4 ciclos"]}'),
('mindfulness-meditation', 'Meditação Mindfulness', 'Observe seus pensamentos sem julgamento', 15, 'Intermediário', 'Mindfulness', '{"steps": ["Sente-se confortavelmente", "Foque na respiração", "Observe pensamentos sem julgamento", "Retorne à respiração", "Continue por 15 minutos"]}'),
('grounding-5-4-3-2-1', 'Técnica 5-4-3-2-1', 'Ancoragem através dos 5 sentidos para crises de ansiedade', 5, 'Iniciante', 'Ansiedade', '{"steps": ["5 coisas que você vê", "4 coisas que você toca", "3 coisas que você ouve", "2 coisas que você cheira", "1 coisa que você sente o gosto"]}'),
('dbt-distress-tolerance', 'Tolerância ao Sofrimento (DBT)', 'Técnicas de sobrevivência para crises emocionais', 12, 'Avançado', 'DBT', '{"steps": ["Identifique a emoção", "Use técnica TIPP", "Pratique auto-compaixão", "Busque apoio se necessário"]}'),
('body-scan', 'Varredura do Corpo', 'Consciência corporal plena', 20, 'Intermediário', 'Mindfulness', '{"steps": ["Deite-se confortavelmente", "Comece pelos dedos dos pés", "Escaneie cada parte do corpo", "Note sensações sem julgar", "Termine na cabeça"]}'),
('cognitive-defusion', 'Defusão Cognitiva (TCC)', 'Separe-se de pensamentos negativos automáticos', 8, 'Intermediário', 'Ansiedade', '{"steps": ["Identifique o pensamento", "Diga: Estou tendo o pensamento de que...", "Observe sem acreditar", "Deixe o pensamento passar"]}')
ON CONFLICT (id) DO NOTHING;

-- Inserir planos de assinatura
INSERT INTO subscription_plans (id, name, description, price, period, features) VALUES
('gratuito', 'Gratuito', 'Perfeito para explorar', 0.00, 'month', '["Primeira sessão com Clara", "Chat limitado (5 sessões/mês)", "Acesso a exercícios básicos", "Dashboard simples", "Suporte por email"]'),
('pro', 'Pro', 'Para uso regular', 29.90, 'month', '["Sessões ilimitadas com Clara", "Chat por voz em tempo real", "Todos os exercícios terapêuticos", "Dashboard avançado com progresso", "Relatórios mensais", "Suporte prioritário", "Chamadas de vídeo com avatar", "Exercícios personalizados"]'),
('premium', 'Premium', 'Máximo bem-estar', 49.90, 'month', '["Tudo do plano Pro", "Suporte prioritário 24/7", "Acesso a psicólogos humanos", "Programas personalizados de TCC/DBT", "Relatórios detalhados com análise IA", "Integração com wearables", "Meditações guiadas exclusivas", "Comunidade privada de suporte"]')
ON CONFLICT (id) DO NOTHING;