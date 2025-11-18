import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'
const logLevel = process.env.LOG_LEVEL || 'info'

export const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

// Create child loggers for different components
export const createLogger = (component: string) => {
  return logger.child({ component })
}

// Mask sensitive data in logs
export const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') return data
  
  const masked = { ...data }
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'email']
  
  for (const field of sensitiveFields) {
    if (field in masked) {
      masked[field] = '***MASKED***'
    }
  }
  
  return masked
}

export default logger