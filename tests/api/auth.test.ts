import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '../setup'

describe('/api/auth/register', () => {
  beforeEach(async () => {
    // Ensure clean state
    await prisma.user.deleteMany()
  })

  it('should register a new user successfully', async () => {
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
    expect(data.data.user).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      verified: true,
    })

    // Verify user was created in database
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    expect(user).toBeTruthy()
    expect(user!.name).toBe('Test User')
  })

  it('should reject duplicate email registration', async () => {
    // Create existing user
    await prisma.user.create({
      data: {
        name: 'Existing User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER',
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
    expect(data.error).toBe('User already exists')
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
    expect(data.error).toBe('Validation failed')
    expect(data.details).toHaveLength(3) // 3 validation errors
  })

  it('should create consent record for new user', async () => {
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

    // Verify consent record was created
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { consents: true }
    })

    expect(user!.consents).toHaveLength(1)
    expect(user!.consents[0].docVersion).toBe('1.0')
    expect(user!.consents[0].ip).toBe('192.168.1.100')
  })
})