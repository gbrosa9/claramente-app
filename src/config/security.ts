import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Storage
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  
  // AI Services
  WHISPER_URL: z.string().url().optional(),
  TTS_PROVIDER: z.enum(['elevenlabs', 'piper']).default('elevenlabs'),
  ELEVENLABS_API_KEY: z.string().optional(),
  PIPER_URL: z.string().url().optional(),
  
  // LLM
  LLM_PROVIDER: z.enum(['openai', 'lmstudio']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  LMSTUDIO_URL: z.string().url().optional(),
  
  // Security
  ALLOWED_ORIGINS: z.string().default('http://localhost:3001'),
  CSRF_SECRET: z.string().min(32).optional(),
  
  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  PROMETHEUS_PORT: z.string().default('9090'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Rate Limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

// Validate environment variables
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    
    // Additional conditional validation
    if (env.LLM_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER is "openai"')
    }
    
    if (env.LLM_PROVIDER === 'lmstudio' && !env.LMSTUDIO_URL) {
      throw new Error('LMSTUDIO_URL is required when LLM_PROVIDER is "lmstudio"')
    }
    
    if (env.TTS_PROVIDER === 'elevenlabs' && !env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is required when TTS_PROVIDER is "elevenlabs"')
    }
    
    if (env.TTS_PROVIDER === 'piper' && !env.PIPER_URL) {
      throw new Error('PIPER_URL is required when TTS_PROVIDER is "piper"')
    }
    
    return env
  } catch (error) {
    console.error('❌ Environment validation failed:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    } else {
      console.error(`  - ${error}`)
    }
    process.exit(1)
  }
}

// Validate on module load
export const env = validateEnv()

// Configuration object
export const config = {
  app: {
    name: 'ClaraMENTE',
    version: process.env.npm_package_version || '1.0.0',
    env: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  
  database: {
    url: env.DATABASE_URL,
  },
  
  redis: {
    url: env.REDIS_URL || 'redis://localhost:6379',
  },
  
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL || 'http://localhost:3001',
    jwtSecret: env.JWT_SECRET,
  },
  
  storage: {
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION,
    bucket: env.STORAGE_BUCKET,
    accessKey: env.STORAGE_ACCESS_KEY,
    secretKey: env.STORAGE_SECRET_KEY,
  },
  
  ai: {
    whisper: {
      url: env.WHISPER_URL || 'http://localhost:9000/v1/audio/transcriptions',
    },
    tts: {
      provider: env.TTS_PROVIDER,
      elevenlabs: {
        apiKey: env.ELEVENLABS_API_KEY,
      },
      piper: {
        url: env.PIPER_URL || 'http://localhost:8080',
      },
    },
    llm: {
      provider: env.LLM_PROVIDER,
      openai: {
        apiKey: env.OPENAI_API_KEY,
      },
      lmstudio: {
        url: env.LMSTUDIO_URL || 'http://localhost:1234/v1',
      },
    },
  },
  
  security: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(','),
    csrfSecret: env.CSRF_SECRET,
  },
  
  observability: {
    otlpEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    prometheusPort: parseInt(env.PROMETHEUS_PORT),
    logLevel: env.LOG_LEVEL,
  },
  
  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },
  
  rateLimit: {
    upstash: {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    },
  },
}