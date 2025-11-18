# 🚀 CONFIGURAÇÃO FINAL - EXECUTE AGORA

## ✅ **1. CRIAR TABELAS DO SISTEMA DE ACOMPANHAMENTO**

**Execute no Supabase SQL Editor:**
👉 https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/sql/new

Cole e execute o conteúdo do arquivo: `007_create_follow_system.sql`

Isso vai criar:
- ✓ Tabela `follow_codes` (códigos de acompanhamento)
- ✓ Tabela `patient_professionals` (vínculos paciente-profissional)
- ✓ Tabela `notifications` (notificações para profissionais)
- ✓ RLS policies (segurança)
- ✓ Triggers automáticos

---

## ✅ **2. HABILITAR CONFIRMAÇÃO DE EMAIL**

### **Passo 2.1: Configurações de Autenticação**
👉 https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/auth/settings

Encontre e configure:
```
[✓] Enable email confirmations: LIGADO
[✓] Enable email change confirmations: LIGADO  
[✓] Secure email change: LIGADO
```

### **Passo 2.2: Configurar Email Template**
👉 https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/auth/templates

Selecione **"Confirm signup"** e edite:

**Subject:**
```
Confirme seu email no ClaraMENTE
```

**Body (HTML):**
```html
<h2>Bem-vindo ao ClaraMENTE!</h2>
<p>Obrigado por se cadastrar. Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}" style="background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirmar Email</a></p>
<p style="color: #666; font-size: 14px; margin-top: 20px;">Se você não criou esta conta, ignore este email.</p>
<p style="color: #999; font-size: 12px; margin-top: 30px;">Este link expira em 1 hora.</p>
```

### **Passo 2.3: Adicionar Redirect URLs**
👉 https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/auth/url-configuration

Em **"Redirect URLs"**, adicione:
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
http://localhost:3000/*
```

**Clique em "Save"**

---

## ✅ **3. TESTAR SISTEMA COMPLETO**

### **3.1. Testar Registro de Paciente**
1. Acesse: http://localhost:3000/register
2. Preencha dados como **paciente**
3. Clique em "Criar Conta"
4. ✅ Deve mostrar: "Verifique seu email para confirmar"
5. ✅ Abra seu email (pode estar em spam)
6. ✅ Clique em "Confirmar Email"
7. ✅ Deve redirecionar para o dashboard

### **3.2. Testar Geração de Código**
1. No dashboard, vá em "Código de Acompanhamento"
2. Clique em "Gerar Código"
3. ✅ Deve mostrar código (ex: `A3B5C7D9`)
4. Copie o código

### **3.3. Testar Resgate de Código (Profissional)**
1. Registre outro usuário como **profissional**
2. Acesse: http://localhost:3000/pro/claim
3. Cole o código do paciente
4. Clique em "Resgatar Código"
5. ✅ Deve mostrar "Paciente vinculado com sucesso!"
6. ✅ Paciente deve aparecer em sua lista

### **3.4. Testar Notificações**
1. Como profissional, acesse: http://localhost:3000/pro/notifications
2. ✅ Deve mostrar notificação de novo paciente

### **3.5. Testar Gerenciamento (Paciente)**
1. Como paciente, acesse: http://localhost:3000/account/connections
2. ✅ Deve mostrar profissional vinculado
3. Clique em "Remover"
4. ✅ Deve remover vínculo

---

## 🔧 **TROUBLESHOOTING**

### Email não chega?
- ✓ Verifique pasta spam/lixo eletrônico
- ✓ Teste com Gmail, Outlook, etc.
- ✓ Verifique logs: https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/logs/edge-logs
- ✓ Aguarde 1-2 minutos (pode demorar)

### Erro "Email link invalid"?
- ✓ Token expira em 1 hora
- ✓ Solicite novo email de confirmação
- ✓ Verifique se URL está completa (não cortada)

### Código não funciona?
- ✓ Verifique console do navegador (F12)
- ✓ Verifique terminal do servidor (npm run dev)
- ✓ Confirme que tabelas foram criadas (passo 1)
- ✓ Confirme que usuário tem role='user' ou 'professional'

---

## 📋 **VERIFICAR SE TUDO ESTÁ CORRETO**

Execute no SQL Editor:

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('follow_codes', 'patient_professionals', 'notifications');

-- Ver usuários e confirmação
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Ver profiles com role
SELECT id, email, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## ✅ **RESUMO DO QUE FOI IMPLEMENTADO**

1. ✅ **Recuperação de senha**: Usando hash fragment do Supabase
2. ✅ **Código de acompanhamento**: Sistema completo de geração
3. ✅ **Vínculo profissional**: Resgate de código e registro automático
4. ✅ **Notificações**: Profissionais recebem notificação de novo paciente
5. ✅ **Gerenciamento**: Pacientes podem remover profissionais
6. ✅ **Email de confirmação**: Configurado, basta habilitar no painel

---

**Após executar os passos acima, TODO O SISTEMA estará funcionando! 🎉**
