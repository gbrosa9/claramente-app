// Arquivo para testar configurações do Google OAuth
// Execute: node check-google-auth.js

// Carregar variáveis de ambiente do .env.local
require('dotenv').config({ path: '.env.local' })

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'JWT_SECRET'
]

console.log('🔍 Verificando configurações do Google OAuth...\n')

let allConfigured = true

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  const isConfigured = value && value !== '' && !value.includes('SEU_') && !value.includes('your-')
  
  console.log(`${isConfigured ? '✅' : '❌'} ${envVar}: ${isConfigured ? 'Configurado' : 'NÃO configurado'}`)
  
  if (!isConfigured) {
    allConfigured = false
  }
})

console.log('\n' + '='.repeat(50))

if (allConfigured) {
  console.log('🎉 Todas as configurações estão prontas!')
  console.log('📝 Para testar, acesse: http://localhost:3000/login')
  console.log('🔗 E clique em "Continuar com Google"')
} else {
  console.log('⚠️  Algumas configurações estão faltando.')
  console.log('📋 Siga o guia para configurar o Google OAuth.')
}

console.log('\n📚 Guia completo: https://next-auth.js.org/providers/google')