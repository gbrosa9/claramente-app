# 🎯 SISTEMA PROFISSIONAL - INSTRUÇÕES DE SETUP

## ✅ **1. EXECUTAR MIGRATIONS NO SUPABASE**

**Acesse:** https://supabase.com/dashboard/project/qetlvvdwfaiasuullxax/sql/new

### **Migration 1: Criar tabelas do sistema de acompanhamento**
Cole e execute: `007_create_follow_system.sql`

### **Migration 2: Atualizar trigger para usar role do metadata**
Cole e execute: `008_update_trigger_with_role.sql`

---

## ✅ **2. TESTAR REGISTRO DE USUÁRIOS**

### **Como Paciente:**
1. Acesse: http://localhost:3000/register
2. Selecione **"Paciente"**
3. Preencha dados e registre
4. Confirme email (se habilitado)
5. Login → redireciona para `/dashboard` (dashboard normal)

### **Como Profissional:**
1. Acesse: http://localhost:3000/register
2. Selecione **"Profissional"**
3. Preencha dados e registre
4. Confirme email (se habilitado)
5. Login → DEVE redirecionar para `/pro/dashboard` (dashboard profissional)

---

## ✅ **3. FUNCIONALIDADES DO DASHBOARD PROFISSIONAL**

### **Dashboard Principal (`/pro/dashboard`)**
✓ Estatísticas: Total de pacientes, ativos, notificações
✓ Campo para resgatar código de acompanhamento
✓ Lista dos 5 pacientes mais recentes
✓ Links rápidos para: todos pacientes, notificações, resgatar código

### **Lista de Pacientes (`/pro/patients`)**
✓ Visualização em grade de todos os pacientes
✓ Busca por nome ou email
✓ Filtro por status (todos/ativos/inativos)
✓ Estatísticas resumidas
✓ Cards com informações básicas de cada paciente

### **Detalhes do Paciente (`/pro/patients/[id]`)**
🚧 **EM DESENVOLVIMENTO**
- Perfil completo do paciente
- Histórico de sessões
- Exercícios realizados
- Gráficos de progresso
- Chat/notas

---

## ✅ **4. IMPLEMENTAR REDIRECIONAMENTO AUTOMÁTICO**

Atualmente, após login, **todos** vão para `/dashboard`. Precisamos redirecionar profissionais automaticamente.

### **Opção 1: Atualizar página `/dashboard`**

Adicione no topo de `/app/dashboard/page.tsx`:

```typescript
useEffect(() => {
  const checkRole = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (profile?.role === 'professional') {
      router.push('/pro/dashboard')
    }
  }
  checkRole()
}, [])
```

### **Opção 2: Criar middleware global**

Criar `/middleware.ts` na raiz:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session && req.nextUrl.pathname === '/dashboard') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (profile?.role === 'professional') {
      return NextResponse.redirect(new URL('/pro/dashboard', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard']
}
```

---

## ✅ **5. FLUXO COMPLETO DE TESTE**

### **Teste 1: Paciente gera código**
1. Registre como **Paciente**
2. Login → vai para `/dashboard`
3. Clique em "Gerar Código de Acompanhamento"
4. Copie o código (ex: `A3B5C7D9`)

### **Teste 2: Profissional resgata código**
1. Registre como **Profissional** (outro email)
2. Login → vai para `/pro/dashboard`
3. Cole o código do paciente
4. Clique em "Resgatar Código"
5. ✅ Paciente aparece na lista!

### **Teste 3: Ver lista de pacientes**
1. Como profissional, clique em "Todos os Pacientes"
2. Acessa `/pro/patients`
3. Vê card do paciente vinculado
4. Clique no card → vai para detalhes (em desenvolvimento)

### **Teste 4: Notificações**
1. Como profissional, acesse `/pro/notifications`
2. Vê notificação de "Novo paciente vinculado"
3. Marca como lida

---

## 📋 **PRÓXIMOS PASSOS (Opcional)**

### **1. Página de Detalhes do Paciente**
- `/app/pro/patients/[id]/page.tsx`
- Mostrar perfil, progresso, exercícios, conversas
- Gráficos de evolução

### **2. Sistema de Sessões**
- Tabela `sessions` para registrar atendimentos
- Contabilizar "Sessões desta Semana"
- Histórico de atendimentos

### **3. Chat Profissional-Paciente**
- Permitir troca de mensagens
- Notificações de novas mensagens
- Histórico completo

### **4. Relatórios e Exports**
- Exportar dados do paciente
- Gerar relatórios PDF
- Estatísticas avançadas

---

## ✅ **RESUMO DO QUE FOI CRIADO**

1. ✅ **Registro**: Seletor Paciente/Profissional
2. ✅ **API**: Salva role no metadata e profile
3. ✅ **Trigger**: Auto-cria profile com role correto
4. ✅ **Dashboard Pro**: `/pro/dashboard` completo
5. ✅ **Lista Pacientes**: `/pro/patients` com busca e filtros
6. ✅ **Resgate Código**: Integrado no dashboard
7. ✅ **Notificações**: Sistema funcional
8. ⏳ **Redirecionamento**: Precisa implementar (Opção 1 ou 2)
9. ⏳ **Detalhes Paciente**: Em desenvolvimento

---

**Após executar as migrations e testar o registro, o sistema estará 90% pronto!** 🚀
