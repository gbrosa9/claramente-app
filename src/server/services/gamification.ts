import { startOfDay, differenceInCalendarDays, isSameDay } from 'date-fns'
import { prisma } from '@/src/server/db'

const EXERCISE_SEED = [
  {
    slug: 'respiracao-rapida-2m',
    title: 'Respiração 4-7-8',
    category: 'respiracao',
    durationMinutes: 2,
    difficulty: 1,
    xpReward: 10,
  },
  {
    slug: 'grounding-ancoragem-3m',
    title: 'Grounding 5-4-3-2-1',
    category: 'crise',
    durationMinutes: 3,
    difficulty: 2,
    xpReward: 12,
  },
  {
    slug: 'relaxamento-guiado-5m',
    title: 'Relaxamento Guiado',
    category: 'sono',
    durationMinutes: 5,
    difficulty: 2,
    xpReward: 15,
  },
]

const FIRST_LEVEL_XP = [50, 70, 100]
const XP_INCREMENT_AFTER_LEVEL = 30

type PrismaWithGamification = typeof prisma & {
  userGamification?: {
    upsert: typeof prisma.userGamification.upsert
    update: typeof prisma.userGamification.update
  }
  exerciseCatalog?: typeof prisma.exerciseCatalog
  exerciseSession?: typeof prisma.exerciseSession
}

let gamificationWarningLogged = false

function logMissingGamificationModels() {
  if (!gamificationWarningLogged) {
    console.warn(
      'Gamification tables are not available on the Prisma client. Did you run `npx prisma generate` after updating prisma/schema.prisma?'
    )
    gamificationWarningLogged = true
  }
}

function getGamificationClient() {
  const client = prisma as PrismaWithGamification

  const hasCatalog = Boolean(client.exerciseCatalog?.findMany && client.exerciseCatalog?.upsert)
  const hasSession = Boolean(client.exerciseSession?.findFirst && client.exerciseSession?.findMany)
  const hasGamification = Boolean(client.userGamification?.upsert && client.userGamification?.update)

  if (hasCatalog && hasSession && hasGamification) {
    return client as Required<PrismaWithGamification>
  }

  logMissingGamificationModels()
  return null
}

function createDefaultProfile(userId: string, overrides: Partial<{ xpTotal: number; xpToday: number; dailyGoal: number; level: number; streakDays: number; bestStreak: number; lastActiveDate: Date | null }> = {}) {
  return {
    userId,
    xpTotal: overrides.xpTotal ?? 0,
    xpToday: overrides.xpToday ?? 0,
    dailyGoal: overrides.dailyGoal ?? 30,
    level: overrides.level ?? 1,
    streakDays: overrides.streakDays ?? 0,
    bestStreak: overrides.bestStreak ?? 0,
    lastActiveDate: overrides.lastActiveDate ?? null,
    updatedAt: new Date(),
  }
}

export interface LevelProgress {
  level: number
  xpTotal: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  xpIntoLevel: number
  xpToNextLevel: number
}

function xpRequiredForLevel(level: number): number {
  if (level <= 1) {
    return FIRST_LEVEL_XP[0]
  }

  if (level === 2) {
    return FIRST_LEVEL_XP[1]
  }

  if (level === 3) {
    return FIRST_LEVEL_XP[2]
  }

  const extraLevels = level - 3
  return FIRST_LEVEL_XP[2] + extraLevels * XP_INCREMENT_AFTER_LEVEL
}

export function getLevelProgress(xpTotal: number): LevelProgress {
  let level = 1
  let xpForCurrentLevel = 0
  let xpForNextLevel = xpRequiredForLevel(level)
  let remainingXp = xpTotal

  while (remainingXp >= xpForNextLevel) {
    remainingXp -= xpForNextLevel
    xpForCurrentLevel += xpForNextLevel
    level += 1
    xpForNextLevel = xpRequiredForLevel(level)
  }

  return {
    level,
    xpTotal,
    xpForCurrentLevel,
    xpForNextLevel: xpForCurrentLevel + xpForNextLevel,
    xpIntoLevel: remainingXp,
    xpToNextLevel: xpForNextLevel - remainingXp,
  }
}

export async function ensureGamificationProfile(userId: string) {
  const client = getGamificationClient()

  if (!client) {
    return createDefaultProfile(userId)
  }

  return client.userGamification.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
    },
  })
}

export async function seedExerciseCatalog() {
  const client = getGamificationClient()

  if (!client) {
    return
  }

  await Promise.all(
    EXERCISE_SEED.map((exercise) =>
      client.exerciseCatalog.upsert({
        where: { slug: exercise.slug },
        update: exercise,
        create: exercise,
      })
    )
  )
}

interface UpdateGamificationInput {
  userId: string
  xpReward: number
  completedAt: Date
}

export async function applyExerciseCompletionGamification({ userId, xpReward, completedAt }: UpdateGamificationInput) {
  const client = getGamificationClient()

  if (!client) {
    const today = startOfDay(completedAt)
    const levelProgress = getLevelProgress(xpReward)
    return {
      gamification: createDefaultProfile(userId, {
        xpTotal: xpReward,
        xpToday: xpReward,
        level: levelProgress.level,
        streakDays: 1,
        bestStreak: 1,
        lastActiveDate: today,
      }),
      levelProgress,
    }
  }

  return prisma.$transaction(async (tx) => {
    const today = startOfDay(completedAt)

    const profile = await tx.userGamification.upsert({
      where: { userId },
      create: {
        userId,
        xpTotal: xpReward,
        xpToday: xpReward,
        level: 1,
        streakDays: 1,
        bestStreak: 1,
        lastActiveDate: today,
      },
      update: {},
    })

    let xpTotal = profile.xpTotal
    let xpToday = profile.xpToday
    let streakDays = profile.streakDays
    const bestStreak = profile.bestStreak
    const lastActiveDate = profile.lastActiveDate ? startOfDay(profile.lastActiveDate) : null

    xpTotal += xpReward

    if (!lastActiveDate) {
      xpToday = xpReward
      streakDays = 1
    } else {
      const diff = differenceInCalendarDays(today, lastActiveDate)

      if (diff === 0) {
        xpToday += xpReward
      } else if (diff === 1) {
        xpToday = xpReward
        streakDays += 1
      } else {
        xpToday = xpReward
        streakDays = 1
      }
    }

    const levelProgress = getLevelProgress(xpTotal)

    const updated = await tx.userGamification.update({
      where: { userId },
      data: {
        xpTotal,
        xpToday,
        level: levelProgress.level,
        streakDays,
        bestStreak: Math.max(bestStreak, streakDays),
        lastActiveDate: today,
        dailyGoal: profile.dailyGoal,
      },
    })

    return {
      gamification: updated,
      levelProgress,
    }
  })
}

function normaliseXpToday(profile: { xpToday: number; lastActiveDate: Date | null }) {
  if (!profile.lastActiveDate) {
    return 0
  }

  return isSameDay(profile.lastActiveDate, new Date()) ? profile.xpToday : 0
}

function titleFromCategory(category: string) {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildFallbackDashboard(userId: string) {
  const profile = createDefaultProfile(userId)
  const levelProgress = getLevelProgress(profile.xpTotal)

  const badges = [
    {
      slug: 'first_exercise',
      title: 'Primeiro passo',
      description: 'Complete um exercício',
      earned: false,
    },
    {
      slug: 'streak_3',
      title: 'Trilha em chamas',
      description: 'Mantenha 3 dias de sequência',
      earned: false,
    },
    {
      slug: 'ten_exercises',
      title: 'Constância',
      description: 'Finalize 10 exercícios',
      earned: false,
    },
    {
      slug: 'perfect_week',
      title: 'Semana perfeita',
      description: 'Complete exercícios em 7 dias seguidos',
      earned: false,
    },
  ]

  return {
    gamification: {
      xpTotal: profile.xpTotal,
      xpToday: 0,
      dailyGoal: profile.dailyGoal,
      level: profile.level,
      streakDays: profile.streakDays,
      bestStreak: profile.bestStreak,
      progress: {
        xpIntoLevel: levelProgress.xpIntoLevel,
        xpToNextLevel: levelProgress.xpToNextLevel,
        currentLevelFloor: levelProgress.xpForCurrentLevel,
        nextLevelFloor: levelProgress.xpForNextLevel,
      },
    },
    continueSession: null,
    quickSessions: EXERCISE_SEED.map((exercise) => ({
      id: exercise.slug,
      slug: exercise.slug,
      title: exercise.title,
      category: exercise.category,
      durationMinutes: exercise.durationMinutes,
      xpReward: exercise.xpReward,
      difficulty: exercise.difficulty,
    })),
    tracks: Array.from(new Set(EXERCISE_SEED.map((exercise) => exercise.category))).map((category) => ({
      category,
      title: titleFromCategory(category),
      completed: 0,
    })),
    badges,
    totals: {
      exercisesCompleted: 0,
    },
  }
}

function isPrismaConnectionIssue(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const candidate = error as { code?: string; message?: string; name?: string }

  if (candidate.code === 'P1001' || candidate.code === 'P1008') {
    return true
  }

  if (candidate.name === 'PrismaClientInitializationError') {
    return true
  }

  if (typeof candidate.message === 'string') {
    const message = candidate.message.toLowerCase()
    return message.includes("can't reach database server") || message.includes('the database server was reached but')
  }

  return false
}

function isMissingGamificationTables(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const candidate = error as { code?: string; message?: string }

  if (candidate.code === 'P2021' || candidate.code === 'P2009') {
    return true
  }

  if (typeof candidate.message === 'string') {
    const message = candidate.message.toLowerCase()
    return (
      message.includes('exercise_catalog') ||
      message.includes('exercise_session') ||
      message.includes('user_gamification')
    )
  }

  return false
}

export async function getPatientDashboardData(userId: string) {
  const client = getGamificationClient()

  if (!client) {
    return buildFallbackDashboard(userId)
  }

  try {
    await seedExerciseCatalog()

    const [profile, continueSession, quickSessions, exerciseStats, distinctTracks] = await Promise.all([
      ensureGamificationProfile(userId),
      client.exerciseSession.findFirst({
        where: {
          userId,
          status: 'started',
        },
        include: {
          exercise: true,
        },
        orderBy: { startedAt: 'desc' },
      }),
      client.exerciseCatalog.findMany({
        where: {
          isActive: true,
          durationMinutes: {
            gte: 2,
            lte: 5,
          },
        },
        orderBy: [
          { durationMinutes: 'asc' },
          { difficulty: 'asc' },
        ],
        take: 6,
      }),
      client.exerciseSession.findMany({
        where: {
          userId,
          status: 'completed',
        },
        select: {
          exercise: {
            select: {
              category: true,
            },
          },
        },
      }),
      client.exerciseCatalog.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
    ])

    const totalCompleted = exerciseStats.length
    const categoryMap = new Map<string, number>()

    exerciseStats.forEach((item) => {
      const category = item.exercise.category
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const levelProgress = getLevelProgress(profile.xpTotal)

    const badges = [
      {
        slug: 'first_exercise',
        title: 'Primeiro passo',
        description: 'Complete um exercício',
        earned: totalCompleted >= 1,
      },
      {
        slug: 'streak_3',
        title: 'Trilha em chamas',
        description: 'Mantenha 3 dias de sequência',
        earned: Math.max(profile.streakDays, profile.bestStreak) >= 3,
      },
      {
        slug: 'ten_exercises',
        title: 'Constância',
        description: 'Finalize 10 exercícios',
        earned: totalCompleted >= 10,
      },
      {
        slug: 'perfect_week',
        title: 'Semana perfeita',
        description: 'Complete exercícios em 7 dias seguidos',
        earned: Math.max(profile.streakDays, profile.bestStreak) >= 7,
      },
    ]

    return {
      gamification: {
        xpTotal: profile.xpTotal,
        xpToday: normaliseXpToday(profile),
        dailyGoal: profile.dailyGoal,
        level: levelProgress.level,
        streakDays: profile.streakDays,
        bestStreak: profile.bestStreak,
        progress: {
          xpIntoLevel: levelProgress.xpIntoLevel,
          xpToNextLevel: levelProgress.xpToNextLevel,
          currentLevelFloor: levelProgress.xpForCurrentLevel,
          nextLevelFloor: levelProgress.xpForNextLevel,
        },
      },
      continueSession,
      quickSessions,
      tracks: distinctTracks.map(({ category }) => ({
        category,
        title: titleFromCategory(category),
        completed: categoryMap.get(category) || 0,
      })),
      badges,
      totals: {
        exercisesCompleted: totalCompleted,
      },
    }
  } catch (error) {
    if (isMissingGamificationTables(error)) {
      logMissingGamificationModels()
      return buildFallbackDashboard(userId)
    }

    if (isPrismaConnectionIssue(error)) {
      console.warn('Gamification service could not reach the database. Returning fallback dashboard.')
      return buildFallbackDashboard(userId)
    }

    throw error
  }
}
