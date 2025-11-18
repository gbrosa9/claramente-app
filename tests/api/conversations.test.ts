import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/conversations/route'
import { GET } from '@/app/api/conversations/route'
import { prisma } from '../setup'
import { getServerSession } from 'next-auth/next'

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn()
}))

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER' as const,
}

describe('/api/conversations', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.user.deleteMany()

    // Create test user
    await prisma.user.create({
      data: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        password: 'hashedpassword',
        role: mockUser.role,
      }
    })

    // Mock authenticated session
    vi.mocked(getServerSession).mockResolvedValue({
      user: mockUser,
      expires: '2024-12-31'
    })
  })

  describe('GET /api/conversations', () => {
    it('should fetch user conversations with pagination', async () => {
      // Create test conversations
      await prisma.conversation.createMany({
        data: [
          {
            id: 'conv-1',
            userId: mockUser.id,
            title: 'First conversation',
            summary: 'Test summary 1',
            topic: 'ANXIETY',
            type: 'CHAT'
          },
          {
            id: 'conv-2',
            userId: mockUser.id,
            title: 'Second conversation',
            summary: 'Test summary 2',
            topic: 'DEPRESSION',
            type: 'VOICE'
          }
        ]
      })

      const request = new NextRequest('http://localhost:3001/api/conversations?limit=10&offset=0')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)
      expect(data.data.conversations).toHaveLength(2)
      expect(data.data.total).toBe(2)
      expect(data.data.conversations[0].title).toBe('Second conversation') // Most recent first
    })

    it('should filter conversations by topic', async () => {
      await prisma.conversation.createMany({
        data: [
          {
            id: 'conv-1',
            userId: mockUser.id,
            title: 'Anxiety chat',
            topic: 'ANXIETY',
            type: 'CHAT'
          },
          {
            id: 'conv-2',
            userId: mockUser.id,
            title: 'Depression chat',
            topic: 'DEPRESSION',
            type: 'CHAT'
          }
        ]
      })

      const request = new NextRequest('http://localhost:3001/api/conversations?topic=ANXIETY')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.conversations).toHaveLength(1)
      expect(data.data.conversations[0].topic).toBe('ANXIETY')
    })

    it('should return empty array when user has no conversations', async () => {
      const request = new NextRequest('http://localhost:3001/api/conversations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.conversations).toHaveLength(0)
      expect(data.data.total).toBe(0)
    })
  })

  describe('POST /api/conversations', () => {
    it('should create new conversation successfully', async () => {
      const requestBody = {
        title: 'New therapy session',
        topic: 'ANXIETY',
        type: 'CHAT'
      }

      const request = new NextRequest('http://localhost:3001/api/conversations', {
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
      expect(data.data.conversation).toMatchObject({
        title: 'New therapy session',
        topic: 'ANXIETY',
        type: 'CHAT',
        userId: mockUser.id,
        status: 'ACTIVE'
      })

      // Verify in database
      const conversation = await prisma.conversation.findUnique({
        where: { id: data.data.conversation.id }
      })
      expect(conversation).toBeTruthy()
    })

    it('should validate required fields', async () => {
      const requestBody = {
        title: '', // Required
        topic: 'INVALID_TOPIC',
        type: 'INVALID_TYPE'
      }

      const request = new NextRequest('http://localhost:3001/api/conversations', {
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
    })

    it('should require authentication', async () => {
      // Mock unauthenticated session
      vi.mocked(getServerSession).mockResolvedValue(null)

      const requestBody = {
        title: 'Test conversation',
        topic: 'ANXIETY',
        type: 'CHAT'
      }

      const request = new NextRequest('http://localhost:3001/api/conversations', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.ok).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })
  })
})