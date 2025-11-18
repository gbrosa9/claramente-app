// Script para resetar rate limiting durante desenvolvimento
// Execute: node reset-rate-limit.js

console.log('🔄 Resetando rate limiting...')

// Para memory store, vamos apenas reiniciar o servidor
console.log('✅ Para resetar completamente o rate limiting:')
console.log('1. Pare o servidor (Ctrl+C)')
console.log('2. Inicie novamente com: npm run dev')
console.log('')
console.log('📝 Configurações atualizadas:')
console.log('- Auth: 50 tentativas por 5 minutos (antes: 5 por 15 minutos)')
console.log('- Rate limiting mais permissivo para desenvolvimento')
console.log('')
console.log('⏱️  Rate limit atual expira em: ' + new Date(Date.now() + 5*60*1000).toLocaleTimeString())