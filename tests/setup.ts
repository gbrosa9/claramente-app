import { beforeEach, vi } from 'vitest'
import { createPrismaMock } from './prismaMock'

Object.assign(process.env, {
  NODE_ENV: 'test',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3001'
})

const prisma = createPrismaMock()

beforeEach(() => {
  prisma.$reset()
})

vi.mock('@/src/server/db', () => ({ prisma }))

export { prisma }