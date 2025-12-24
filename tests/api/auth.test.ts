import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'

const signUpMock = vi.fn()

vi.mock('@/lib/supabase/auth', () => ({
  createAuthClient: () => ({
    auth: {
      signUp: signUpMock
    }
  })
}))

describe('/api/auth/register', () => {
  beforeEach(async () => {
    signUpMock.mockReset()
  })

  it('should register a new user successfully', async () => {
    signUpMock.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          email_confirmed_at: null,
          user_metadata: {
            name: 'Test User',
            role: 'user',
            locale: 'pt-BR'
          }
        }
      },
      error: null
    })

    const requestBody = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      locale: 'pt-BR'
    }

    const request = new NextRequest('http://localhost:3001/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.data.user.email).toBe('test@example.com')
    expect(data.data.needsConfirmation).toBe(true)

    expect(signUpMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: expect.objectContaining({
        data: expect.objectContaining({ name: 'Test User', role: 'user', locale: 'pt-BR' })
      })
    })
  })

  it('should reject duplicate email registration', async () => {
    signUpMock.mockResolvedValueOnce({
      data: { user: null },
      error: {
        message: 'User already registered',
        status: 400
      }
    })

    const requestBody = {
      name: 'New User',
      email: 'test@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3001/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.ok).toBe(false)
    expect(data.error).toContain('já está cadastrado')
  })

  it('should validate required fields', async () => {
    const requestBody = {
      name: '',
      email: 'invalid-email',
      password: '123', // Too short
    }

    const request = new NextRequest('http://localhost:3001/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.ok).toBe(false)
    expect(data.error).toContain('Nome deve ter')
  })

  it('should create consent record for new user', async () => {
    signUpMock.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          email_confirmed_at: null,
          user_metadata: {}
        }
      },
      error: null
    })

    const requestBody = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3001/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.100',
        'user-agent': 'Test Browser',
      },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const cookieHeader = response.headers.get('set-cookie')
    expect(cookieHeader).toContain('pendingSignupEmail')
  })
})