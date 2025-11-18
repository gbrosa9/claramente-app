export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400)
    this.details = details
  }

  public readonly details?: any
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429)
  }
}

export class LLMError extends AppError {
  constructor(message: string, code: string = 'LLM_ERROR') {
    super(message, code, 500)
  }
}

export class QuotaExceededError extends LLMError {
  constructor(message: string = 'API quota exceeded') {
    super(message, 'QUOTA_EXCEEDED')
  }
}

export class AudioProcessingError extends AppError {
  constructor(message: string, code: string = 'AUDIO_ERROR') {
    super(message, code, 500)
  }
}

export class WebSocketError extends AppError {
  constructor(message: string, code: string = 'WEBSOCKET_ERROR') {
    super(message, code, 500)
  }
}

export class JobError extends AppError {
  constructor(message: string, code: string = 'JOB_ERROR') {
    super(message, code, 500)
  }
}