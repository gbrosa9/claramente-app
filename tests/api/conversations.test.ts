import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { POST, GET } from '@/app/api/conversations/route'
import { prisma } from '../setup'

vi.mock('@/src/server/auth/middleware', () => ({
  requireAuth: vi.fn()
}))

import { requireAuth } from '@/src/server/auth/middleware'

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

    vi.mocked(requireAuth).mockResolvedValue({ user: mockUser } as any)
  })

  describe('GET /api/conversations', () => {
    it('should fetch user conversations with pagination', async () => {
      await prisma.conversation.createMany({
        data: [
          {
            id: 'conv-1',
            userId: mockUser.id,
            title: 'First conversation',
            createdAt: new Date('2024-01-01T10:00:00Z'),
            lastMessageAt: new Date('2024-01-01T10:00:00Z')
          },
          {
            id: 'conv-2',
            userId: mockUser.id,
            title: 'Second conversation',
            createdAt: new Date('2024-01-01T11:00:00Z'),
            lastMessageAt: new Date('2024-01-01T11:00:00Z')
          }
        ]
      })

      const request = new NextRequest('http://localhost:3001/api/conversations?limit=10&offset=0')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)
      expect(data.data.conversations).toHaveLength(2)
      expect(data.data.pagination.total).toBe(2)
      expect(data.data.conversations[0].title).toBe('Second conversation')
    })

    it('should ignore unsupported filters gracefully', async () => {
      await prisma.conversation.createMany({
        data: [
          {
            id: 'conv-1',
            userId: mockUser.id,
            title: 'Anxiety chat'
          },
          {
            id: 'conv-2',
            userId: mockUser.id,
            title: 'Depression chat'
          }
        ]
      })

      const request = new NextRequest('http://localhost:3001/api/conversations?topic=ANXIETY')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)
      expect(Array.isArray(data.data.conversations)).toBe(true)
    })

    it('should return empty array when user has no conversations', async () => {
      const request = new NextRequest('http://localhost:3001/api/conversations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.conversations).toHaveLength(0)
      expect(data.data.pagination.total).toBe(0)
    })
  })

  describe('POST /api/conversations', () => {
    it('should create new conversation successfully', async () => {
      const requestBody = {
        title: 'New therapy session'
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
      expect(data.data.conversation.title).toBe('New therapy session')

      const conversation = await prisma.conversation.findUnique({
        where: { id: data.data.conversation.id }
      })
      expect(conversation).toBeTruthy()
      expect(conversation?.title).toBe('New therapy session')
    })

    it('should default title when none provided', async () => {
      const request = new NextRequest('http://localhost:3001/api/conversations', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)
      expect(data.data.conversation.title).toBe('Nova conversa')
    })

    it('should require authentication', async () => {
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
      )

      const request = new NextRequest('http://localhost:3001/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test conversation' }),
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