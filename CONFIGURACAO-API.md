# 🔑 Configuração das Chaves de API

Para que a IA Clara funcione em tempo real tanto no **chat de texto** quanto no **modo de voz**, você precisa configurar sua chave da OpenAI.

## 📋 Passo a Passo

### 1. Obtenha sua Chave da OpenAI

1. Vá para [platform.openai.com](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Navegue para **API Keys** no menu lateral
4. Clique em **Create new secret key**
5. Copie a chave que foi gerada (começa com `sk-...`)

### 2. Configure no Projeto

Abra o arquivo `.env.local` na raiz do projeto e adicione sua chave:

```bash
# OpenAI API - OBRIGATÓRIO para IA funcionar
OPENAI_API_KEY="sua-chave-aqui"
```

**Exemplo:**
```bash
OPENAI_API_KEY="sk-proj-abc123def456..."
```

### 3. Reinicie o Servidor

Após adicionar a chave, reinicie o servidor:

```bash
npm run dev
```

## ✅ Funcionalidades Habilitadas

Com a chave configurada, você terá:

### 🗨️ Chat de Texto
- Conversas em tempo real com Clara
- Respostas baseadas em TCC/DBT
- Validação emocional e técnicas terapêuticas
- Personalização com o nome do usuário

### 🎤 Chat de Voz
- **Fale com Clara**: Grave sua mensagem e ela será transcrita automaticamente
- **Ouça Clara**: As respostas são convertidas em áudio com voz natural
- **Conversação fluida**: Sistema completo de voz bidirecional

## 🔧 Modelos Utilizados

- **Chat**: `gpt-4o-mini` (otimizado para conversas terapêuticas)
- **Voz para Texto**: `whisper-1` (transcrição em português)
- **Texto para Voz**: `tts-1` com voz `nova` (calorosa e terapêutica)

## 💰 Custos Aproximados

- **Chat de texto**: ~$0.001 por conversa
- **Transcrição de voz**: ~$0.006 por minuto
- **Síntese de voz**: ~$0.015 por 1000 caracteres

## 🔒 Segurança

- ✅ Autenticação obrigatória (Google OAuth)
- ✅ Validação de respostas para segurança clínica
- ✅ Proteção contra diagnósticos inadequados
- ✅ Orientação para emergências

## 🚨 Em Caso de Problemas

### Erro: "Chave da API OpenAI inválida"
- Verifique se a chave está correta no `.env.local`
- Certifique-se de que não há espaços extras
- Confirme se a chave tem saldo/créditos

### Erro: "Cota da API esgotada"
- Adicione créditos na sua conta OpenAI
- Verifique limites de uso em platform.openai.com

### Problema com áudio
- Verifique se o navegador permite acesso ao microfone
- Teste em diferentes navegadores
- Confirme se a conexão de internet está estável

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs no console do navegador (F12)
2. Confirme se todas as dependências estão instaladas
3. Teste com uma mensagem simples primeiro

---

**🎉 Pronto! Agora Clara pode conversar com você em tempo real! 🎉**