import { randomUUID } from 'node:crypto'

interface ConsentRecord {
  id: string
  userId: string
  docVersion: string
  ip?: string
  userAgent?: string
  createdAt: Date
}

interface UserRecord {
  id: string
  name: string
  email: string
  password?: string
  role: string
  locale?: string
  verified: boolean
  consents: ConsentRecord[]
  createdAt: Date
  updatedAt: Date
}

interface ConversationRecord {
  id: string
  userId: string
  title?: string | null
  archived: boolean
  deletedAt: Date | null
  lastMessageAt: Date | null
  createdAt: Date
  updatedAt: Date
  messages: string[]
}

interface MessageRecord {
  id: string
  conversationId: string
  sender?: string
  text?: string
  audioUrl?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

interface AssessmentRecord {
  id: string
  type: string
  name: string
  version?: string
  description?: string | null
  items: unknown
  scoring: unknown
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type SelectShape<T> = {
  [K in keyof T]?: boolean
}

type CountSelect = {
  messages?: boolean
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function ensureId(id?: string, prefix?: string): string {
  return id ?? `${prefix ?? 'id'}_${randomUUID()}`
}

function sortByDateDescending<T extends { [key: string]: Date | null }>(items: T[], key: keyof T): T[] {
  return [...items].sort((a, b) => {
    const first = a[key] instanceof Date ? (a[key] as Date).getTime() : 0
    const second = b[key] instanceof Date ? (b[key] as Date).getTime() : 0
    return second - first
  })
}

export interface PrismaMock {
  user: {
    deleteMany(): Promise<{ count: number }>
    create(args: { data: Partial<UserRecord> }): Promise<UserRecord>
    createMany(args: { data: Array<Partial<UserRecord>> }): Promise<{ count: number }>
    findUnique(args: { where: { id?: string; email?: string }; include?: { consents?: boolean } }): Promise<(UserRecord & { consents?: ConsentRecord[] }) | null>
  }
  conversation: {
    deleteMany(): Promise<{ count: number }>
    createMany(args: { data: Array<Partial<ConversationRecord>> }): Promise<{ count: number }>
    create(args: { data: Partial<ConversationRecord>; select?: SelectShape<ConversationRecord> & { _count?: { select: CountSelect } } }): Promise<Partial<ConversationRecord> & { _count?: { messages: number } }>
    findMany(args: {
      where: Partial<ConversationRecord> & { archived?: boolean; deletedAt?: null }
      select?: SelectShape<ConversationRecord> & { _count?: { select: CountSelect } }
      orderBy?: { lastMessageAt?: 'asc' | 'desc'; createdAt?: 'asc' | 'desc' }
      skip?: number
      take?: number
    }): Promise<Array<Partial<ConversationRecord> & { _count?: { messages: number } }>>
    count(args: { where: Partial<ConversationRecord> & { archived?: boolean; deletedAt?: null } }): Promise<number>
    findUnique(args: { where: { id: string } }): Promise<ConversationRecord | null>
  }
  message: {
    deleteMany(): Promise<{ count: number }>
    create(args: { data: Partial<MessageRecord> }): Promise<MessageRecord>
  }
  assessment: {
    deleteMany(): Promise<{ count: number }>
    createMany(args: { data: Array<Partial<AssessmentRecord>> }): Promise<{ count: number }>
    create(args: { data: Partial<AssessmentRecord> }): Promise<AssessmentRecord>
    findMany(args: {
      where?: { publishedAt?: { not?: null } }
      select?: SelectShape<AssessmentRecord>
      orderBy?: { publishedAt?: 'asc' | 'desc' }
    }): Promise<Array<Partial<AssessmentRecord>>>
  }
  $reset(): void
}

export function createPrismaMock(): PrismaMock {
  const users = new Map<string, UserRecord>()
  const conversations = new Map<string, ConversationRecord>()
  const messages = new Map<string, MessageRecord>()
  const assessments = new Map<string, AssessmentRecord>()

  const result: PrismaMock = {
    user: {
      async deleteMany() {
        const count = users.size
        users.clear()
        return { count }
      },
      async create({ data }) {
        const now = new Date()
        const id = ensureId(data.id, 'user')
        const record: UserRecord = {
          id,
          name: data.name ?? 'User',
          email: data.email ?? `${id}@example.com`,
          password: data.password,
          role: data.role ?? 'USER',
          locale: data.locale ?? 'pt-BR',
          verified: data.verified ?? true,
          consents: data.consents ? data.consents.map(consent => ({
            id: ensureId(consent.id, 'consent'),
            userId: id,
            docVersion: consent.docVersion ?? '1.0',
            ip: consent.ip,
            userAgent: consent.userAgent,
            createdAt: consent.createdAt ?? now,
          })) : [],
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        }

        users.set(id, record)
        return clone(record)
      },
      async createMany({ data }) {
        data.forEach(entry => {
          void result.user.create({ data: entry })
        })
        return { count: data.length }
      },
      async findUnique({ where, include }) {
        const record = where.email
          ? [...users.values()].find(user => user.email === where.email)
          : where.id
            ? users.get(where.id)
            : undefined

        if (!record) {
          return null
        }

        const payload = clone(record)

        if (include?.consents) {
          payload.consents = clone(record.consents)
        } else {
          delete payload.consents
        }

        return payload
      }
    },
    conversation: {
      async deleteMany() {
        const count = conversations.size
        conversations.clear()
        messages.clear()
        return { count }
      },
      async createMany({ data }) {
        data.forEach(entry => {
          const id = ensureId(entry.id, 'conv')
          conversations.set(id, {
            id,
            userId: entry.userId ?? 'user',
            title: entry.title ?? null,
            archived: entry.archived ?? false,
            deletedAt: entry.deletedAt ?? null,
            lastMessageAt: entry.lastMessageAt ?? entry.createdAt ?? new Date(),
            createdAt: entry.createdAt ?? new Date(),
            updatedAt: entry.updatedAt ?? new Date(),
            messages: [],
          })
        })
        return { count: data.length }
      },
      async create({ data, select }) {
        const now = new Date()
        const id = ensureId(data.id, 'conv')
        const record: ConversationRecord = {
          id,
          userId: data.userId ?? 'user',
          title: data.title ?? null,
          archived: data.archived ?? false,
          deletedAt: data.deletedAt ?? null,
          lastMessageAt: data.lastMessageAt ?? now,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
          messages: [],
        }

        conversations.set(id, record)
        return applyConversationSelect(record, select)
      },
      async findMany({ where, select, orderBy, skip, take }) {
        const collection = [...conversations.values()].filter(record => {
          if (where.userId && record.userId !== where.userId) return false
          if (where.archived !== undefined && record.archived !== where.archived) return false
          if (where.deletedAt === null && record.deletedAt !== null) return false
          return true
        })

        let ordered = collection

        if (orderBy?.lastMessageAt) {
          ordered = sortByDateDescending(collection, 'lastMessageAt')
          if (orderBy.lastMessageAt === 'asc') {
            ordered = [...ordered].reverse()
          }
        } else if (orderBy?.createdAt) {
          ordered = sortByDateDescending(collection, 'createdAt')
          if (orderBy.createdAt === 'asc') {
            ordered = [...ordered].reverse()
          }
        }

        const start = skip ?? 0
        const end = take ? start + take : undefined
        const paginated = ordered.slice(start, end)

        return paginated.map(record => applyConversationSelect(record, select))
      },
      async count({ where }) {
        return [...conversations.values()].filter(record => {
          if (where.userId && record.userId !== where.userId) return false
          if (where.archived !== undefined && record.archived !== where.archived) return false
          if (where.deletedAt === null && record.deletedAt !== null) return false
          return true
        }).length
      },
      async findUnique({ where }) {
        const record = conversations.get(where.id)
        return record ? clone(record) : null
      }
    },
    message: {
      async deleteMany() {
        const count = messages.size
        messages.clear()
        conversations.forEach(conversation => {
          conversation.messages = []
        })
        return { count }
      },
      async create({ data }) {
        const now = new Date()
        const id = ensureId(data.id, 'msg')
        const record: MessageRecord = {
          id,
          conversationId: data.conversationId ?? 'conv',
          sender: data.sender,
          text: data.text,
          audioUrl: data.audioUrl,
          metadata: data.metadata as Record<string, unknown> | undefined,
          createdAt: data.createdAt ?? now,
        }

        messages.set(id, record)
        const conversation = conversations.get(record.conversationId)
        if (conversation) {
          conversation.messages.push(id)
          conversation.lastMessageAt = record.createdAt
          conversation.updatedAt = record.createdAt
        }

        return clone(record)
      }
    },
    assessment: {
      async deleteMany() {
        const count = assessments.size
        assessments.clear()
        return { count }
      },
      async createMany({ data }) {
        data.forEach(entry => {
          void result.assessment.create({ data: entry })
        })
        return { count: data.length }
      },
      async create({ data }) {
        const now = new Date()
        const id = ensureId(data.id, 'assessment')
        const record: AssessmentRecord = {
          id,
          type: data.type ?? 'CUSTOM',
          name: data.name ?? 'Assessment',
          version: data.version ?? '1.0',
          description: data.description ?? null,
          items: data.items ?? data.questions ?? [],
          scoring: data.scoring ?? {},
          publishedAt: data.publishedAt ?? null,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        }

        assessments.set(id, record)
        return clone(record)
      },
      async findMany({ where, select, orderBy }) {
        let collection = [...assessments.values()]

        if (where?.publishedAt?.not === null) {
          collection = collection.filter(record => record.publishedAt !== null)
        }

        if (orderBy?.publishedAt) {
          collection = sortByDateDescending(collection, 'publishedAt')
          if (orderBy.publishedAt === 'asc') {
            collection = [...collection].reverse()
          }
        }

        return collection.map(record => applySelect(record, select))
      }
    },
    $reset() {
      users.clear()
      conversations.clear()
      messages.clear()
      assessments.clear()
    }
  }

  return result
}

function applySelect<T extends Record<string, any>>(record: T, select?: SelectShape<T>): Partial<T> {
  if (!select) {
    return clone(record)
  }

  const result: Record<string, unknown> = {}

  for (const key of Object.keys(select) as Array<keyof T>) {
    if (select[key]) {
      result[key as string] = clone(record[key])
    }
  }

  return result as Partial<T>
}

function applyConversationSelect(record: ConversationRecord, select?: SelectShape<ConversationRecord> & { _count?: { select: CountSelect } }): Partial<ConversationRecord> & { _count?: { messages: number } } {
  if (!select) {
    return clone(record)
  }

  const result: Record<string, unknown> = {}

  for (const key of Object.keys(select) as Array<keyof ConversationRecord>) {
    if (key === '_count') {
      continue
    }

    if (select[key]) {
      result[key as string] = clone(record[key])
    }
  }

  if (select._count?.select?.messages) {
    result._count = { messages: record.messages.length }
  }

  return result as Partial<ConversationRecord> & { _count?: { messages: number } }
}
