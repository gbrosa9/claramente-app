-- Inserir dados iniciais nas tabelas

ALTER TABLE user_exercises DROP CONSTRAINT IF EXISTS user_exercises_exercise_id_fkey;
ALTER TABLE progress_tracking DROP CONSTRAINT IF EXISTS progress_tracking_exercise_id_fkey;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'exercises'
			AND column_name = 'id'
			AND data_type <> 'text'
	) THEN
		ALTER TABLE exercises
			ALTER COLUMN id TYPE TEXT USING id::text;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'user_exercises'
			AND column_name = 'exercise_id'
			AND data_type <> 'text'
	) THEN
		ALTER TABLE user_exercises
			ALTER COLUMN exercise_id TYPE TEXT USING exercise_id::text;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'progress_tracking'
			AND column_name = 'exercise_id'
			AND data_type <> 'text'
	) THEN
		ALTER TABLE progress_tracking
			ALTER COLUMN exercise_id TYPE TEXT USING exercise_id::text;
	END IF;
END $$;

ALTER TABLE user_exercises
	ADD CONSTRAINT user_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE progress_tracking
	ADD CONSTRAINT progress_tracking_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE exercises
	DROP CONSTRAINT IF EXISTS exercises_difficulty_check,
	DROP CONSTRAINT IF EXISTS exercises_category_check,
	DROP CONSTRAINT IF EXISTS exercises_type_check,
	ADD COLUMN IF NOT EXISTS category TEXT,
	ADD COLUMN IF NOT EXISTS instructions JSONB NOT NULL DEFAULT '{}';

-- Inserir exercícios básicos
INSERT INTO exercises (id, type, title, description, duration, difficulty, category, instructions) VALUES
('box-breathing', 'exercise', 'Respiração 4-4-4-4', 'Técnica clássica de respiração caixa para acalmar o sistema nervoso', 5, 'Iniciante', 'Respiração', '{"steps": ["Inspire por 4 segundos", "Segure por 4 segundos", "Expire por 4 segundos", "Segure por 4 segundos", "Repita o ciclo"]}'),
('progressive-relaxation', 'exercise', 'Relaxamento Progressivo', 'Tense e solte grupos musculares para reduzir tensão', 10, 'Intermediário', 'Ansiedade', '{"steps": ["Comece pelos pés", "Contraia por 5 segundos", "Relaxe por 10 segundos", "Suba para as panturrilhas", "Continue até a cabeça"]}'),
('4-7-8-breathing', 'exercise', 'Respiração 4-7-8', 'Técnica avançada para ansiedade e insônia', 8, 'Avançado', 'Respiração', '{"steps": ["Inspire por 4 segundos", "Segure por 7 segundos", "Expire por 8 segundos", "Repita 4 ciclos"]}'),
('mindfulness-meditation', 'exercise', 'Meditação Mindfulness', 'Observe seus pensamentos sem julgamento', 15, 'Intermediário', 'Mindfulness', '{"steps": ["Sente-se confortavelmente", "Foque na respiração", "Observe pensamentos sem julgamento", "Retorne à respiração", "Continue por 15 minutos"]}'),
('grounding-5-4-3-2-1', 'exercise', 'Técnica 5-4-3-2-1', 'Ancoragem através dos 5 sentidos para crises de ansiedade', 5, 'Iniciante', 'Ansiedade', '{"steps": ["5 coisas que você vê", "4 coisas que você toca", "3 coisas que você ouve", "2 coisas que você cheira", "1 coisa que você sente o gosto"]}'),
('dbt-distress-tolerance', 'exercise', 'Tolerância ao Sofrimento (DBT)', 'Técnicas de sobrevivência para crises emocionais', 12, 'Avançado', 'DBT', '{"steps": ["Identifique a emoção", "Use técnica TIPP", "Pratique auto-compaixão", "Busque apoio se necessário"]}'),
('body-scan', 'exercise', 'Varredura do Corpo', 'Consciência corporal plena', 20, 'Intermediário', 'Mindfulness', '{"steps": ["Deite-se confortavelmente", "Comece pelos dedos dos pés", "Escaneie cada parte do corpo", "Note sensações sem julgar", "Termine na cabeça"]}'),
('cognitive-defusion', 'exercise', 'Defusão Cognitiva (TCC)', 'Separe-se de pensamentos negativos automáticos', 8, 'Intermediário', 'Ansiedade', '{"steps": ["Identifique o pensamento", "Diga: Estou tendo o pensamento de que...", "Observe sem acreditar", "Deixe o pensamento passar"]}')
ON CONFLICT (id) DO NOTHING;

-- Inserir planos de assinatura
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'subscription_plans'
			AND column_name = 'id'
			AND data_type <> 'text'
	) THEN
		ALTER TABLE subscription_plans
			ALTER COLUMN id TYPE TEXT USING id::text;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'subscriptions'
			AND column_name = 'plan_id'
			AND data_type <> 'text'
	) THEN
		ALTER TABLE subscriptions
			ALTER COLUMN plan_id TYPE TEXT USING plan_id::text;
	END IF;
END $$;

ALTER TABLE subscription_plans
	ADD COLUMN IF NOT EXISTS period TEXT,
	ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]',
	ADD COLUMN IF NOT EXISTS duration_months INTEGER NOT NULL DEFAULT 1;

ALTER TABLE subscriptions
	ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;

INSERT INTO subscription_plans (id, name, description, price, period, features, duration_months) VALUES
('gratuito', 'Gratuito', 'Perfeito para explorar', 0.00, 'month', '["Primeira sessão com Clara", "Chat limitado (5 sessões/mês)", "Acesso a exercícios básicos", "Dashboard simples", "Suporte por email"]', 1),
('pro', 'Pro', 'Para uso regular', 29.90, 'month', '["Sessões ilimitadas com Clara", "Chat por voz em tempo real", "Todos os exercícios terapêuticos", "Dashboard avançado com progresso", "Relatórios mensais", "Suporte prioritário", "Chamadas de vídeo com avatar", "Exercícios personalizados"]', 1),
('premium', 'Premium', 'Máximo bem-estar', 49.90, 'month', '["Tudo do plano Pro", "Suporte prioritário 24/7", "Acesso a psicólogos humanos", "Programas personalizados de TCC/DBT", "Relatórios detalhados com análise IA", "Integração com wearables", "Meditações guiadas exclusivas", "Comunidade privada de suporte"]', 1)
ON CONFLICT (id) DO NOTHING;