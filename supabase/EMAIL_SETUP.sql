-- ========================================
-- CONFIGURAÇÃO DE EMAIL NO SUPABASE
-- ========================================

-- PASSO 1: Verificar configuração atual de email
-- Acesse: https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/auth/settings

-- PASSO 2: Habilitar confirmação de email
-- Em "Auth Settings", configure:
-- ✓ Enable email confirmations: LIGADO
-- ✓ Enable email change confirmations: LIGADO
-- ✓ Secure email change: LIGADO

-- PASSO 3: Configurar Email Templates
-- Acesse: https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/auth/templates

-- Template: Confirm signup
-- Subject: Confirme seu email no ClaraMENTE
-- Body:
/*
<h2>Bem-vindo ao ClaraMENTE!</h2>
<p>Obrigado por se cadastrar. Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Se você não criou esta conta, ignore este email.</p>
*/

-- PASSO 4: Configurar Redirect URLs
-- Em "Redirect URLs", adicione:
-- http://localhost:3000/auth/callback
-- http://localhost:3000/dashboard
-- https://seu-dominio.com/auth/callback (quando publicar)

-- PASSO 5: Verificar que Double Opt-In está habilitado
-- Isso garante que usuários precisam confirmar email antes de fazer login

-- PASSO 6: (OPCIONAL) Configurar SMTP customizado
-- Se quiser usar seu próprio servidor de email:
-- Settings > Project Settings > Authentication > SMTP Settings
-- Configure: Host, Port, Username, Password, Sender Email

-- ========================================
-- DEPOIS DE CONFIGURAR, TESTE:
-- ========================================
-- 1. Registre novo usuário em: http://localhost:3000/signup
-- 2. Verifique email (pode estar em spam)
-- 3. Clique no link de confirmação
-- 4. Deve redirecionar para o dashboard

-- ========================================
-- SCRIPT SQL PARA VERIFICAR USUÁRIOS
-- ========================================

-- Ver usuários e status de confirmação
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmado'
    ELSE 'Pendente'
  END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- Forçar confirmação manual (apenas para desenvolvimento/teste)
-- ATENÇÃO: Use apenas para testar, não em produção!
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email = 'seu-email@exemplo.com';

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Se emails não chegam:
-- 1. Verifique spam/lixo eletrônico
-- 2. Teste com diferentes provedores (Gmail, Outlook)
-- 3. Verifique logs em: https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/logs/edge-logs
-- 4. Considere configurar SMTP customizado

-- Se erro "Email link is invalid or has expired":
-- 1. Token expira em 1 hora por padrão
-- 2. Configure "Email Link Validity" nas configurações
-- 3. Reenvie email de confirmação
