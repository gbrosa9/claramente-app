import nodemailer from 'nodemailer'
import { logger } from './logger'

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ClaraMENTE" <noreply@claramente.app>',
    to: email,
    subject: 'Recuperação de Senha - ClaraMENTE',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; color: #64748b; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧠 ClaraMENTE</h1>
          </div>
          <div class="content">
            <h2>Olá ${name},</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta ClaraMENTE.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link expira em 1 hora</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Nunca compartilhe este link com outras pessoas</li>
              </ul>
            </div>
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #7c3aed;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>Este email foi enviado automaticamente. Não responda a este email.</p>
            <p>&copy; 2025 ClaraMENTE - Cuidando da sua saúde mental</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info({ email }, 'Password reset email sent successfully')
  } catch (error) {
    logger.error({ error, email }, 'Failed to send password reset email')
    throw error
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ClaraMENTE" <noreply@claramente.app>',
    to: email,
    subject: 'Bem-vindo ao ClaraMENTE! 🧠',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; color: #64748b; }
          .feature { background-color: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧠 ClaraMENTE</h1>
          </div>
          <div class="content">
            <h2>Bem-vindo, ${name}! 🎉</h2>
            <p>Estamos muito felizes em tê-lo conosco na sua jornada de bem-estar mental.</p>
            
            <h3>O que você pode fazer agora:</h3>
            
            <div class="feature">
              <strong>💬 Conversar com Clara</strong><br>
              Nossa IA terapeuta está pronta para te ajudar
            </div>
            
            <div class="feature">
              <strong>🧘‍♀️ Exercícios de Bem-estar</strong><br>
              Meditação, respiração e mindfulness
            </div>
            
            <div class="feature">
              <strong>📞 Chamadas de Voz</strong><br>
              Sessões interativas com avatar em tempo real
            </div>
            
            <div class="feature">
              <strong>📊 Acompanhe seu Progresso</strong><br>
              Dashboard personalizado com métricas
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Começar Agora</a>
            </div>
            
            <p>Lembre-se: sua saúde mental é importante. Estamos aqui para apoiá-lo em cada passo do caminho.</p>
          </div>
          <div class="footer">
            <p>Precisa de ajuda? Entre em contato conosco em suporte@claramente.app</p>
            <p>&copy; 2025 ClaraMENTE - Cuidando da sua saúde mental</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    logger.info({ email }, 'Welcome email sent successfully')
  } catch (error) {
    logger.error({ error, email }, 'Failed to send welcome email')
    throw error
  }
}