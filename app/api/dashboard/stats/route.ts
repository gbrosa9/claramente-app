import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'
import { logger } from '@/src/server/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    // Get conversation count and recent activity
    const conversations = await prisma.conversation.findMany({
      where: { 
        userId: user.id,
        deletedAt: null 
      },
      include: {
        messages: {
          select: {
            id: true,
            createdAt: true,
            sender: true
          }
        }
      }
    })

    // Calculate statistics
    const totalConversations = conversations.length
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0)
    
    // Get messages from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentMessages = conversations.flatMap(conv => 
      conv.messages.filter(msg => 
        msg.createdAt >= sevenDaysAgo && msg.sender === 'USER'
      )
    )

    // Calculate streak (consecutive days with activity)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentStreak = 0
    let checkDate = new Date(today)
    
    while (currentStreak < 30) { // Max 30 days check
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(checkDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const hasActivityThisDay = conversations.some(conv =>
        conv.messages.some(msg => 
          msg.createdAt >= dayStart && 
          msg.createdAt <= dayEnd && 
          msg.sender === 'USER'
        )
      )
      
      if (hasActivityThisDay) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Messages today
    const todayStart = new Date(today)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)
    
    const messagesToday = conversations.flatMap(conv => 
      conv.messages.filter(msg => 
        msg.createdAt >= todayStart && 
        msg.createdAt <= todayEnd && 
        msg.sender === 'USER'
      )
    ).length

    // Weekly mood data (simulated for now - in real app would come from mood tracking)
    const weeklyMood = [
      { date: "Seg", mood: Math.floor(Math.random() * 3) + 6 },
      { date: "Ter", mood: Math.floor(Math.random() * 3) + 6 },
      { date: "Qua", mood: Math.floor(Math.random() * 3) + 6 },
      { date: "Qui", mood: Math.floor(Math.random() * 3) + 7 },
      { date: "Sex", mood: Math.floor(Math.random() * 3) + 7 },
      { date: "Sab", mood: Math.floor(Math.random() * 3) + 8 },
      { date: "Dom", mood: Math.floor(Math.random() * 3) + 7 },
    ]

    // Weekly activity data
    const weeklyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayMessages = conversations.flatMap(conv => 
        conv.messages.filter(msg => 
          msg.createdAt >= date && 
          msg.createdAt <= dayEnd && 
          msg.sender === 'USER'
        )
      ).length

      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
      weeklyActivity.push({
        day: dayNames[date.getDay()],
        exercises: Math.min(dayMessages, 5) // Simulate exercises based on activity
      })
    }

    // User level calculation (based on total messages)
    let userLevel = 1
    if (totalMessages >= 10) userLevel = 2
    if (totalMessages >= 50) userLevel = 3
    if (totalMessages >= 100) userLevel = 4

    // Achievements
    const achievements = [
      { 
        milestone: "Primeira Sessão", 
        completed: totalMessages > 0, 
        date: conversations.length > 0 ? conversations[0].createdAt : null 
      },
      { 
        milestone: "5 Conversas Completas", 
        completed: totalMessages >= 10, 
        date: totalMessages >= 10 ? "1 semana atrás" : "Em progresso" 
      },
      { 
        milestone: `Sequência de ${currentStreak} Dias`, 
        completed: currentStreak >= 3, 
        date: currentStreak >= 3 ? "Hoje" : "Em progresso" 
      },
      { 
        milestone: "50 Interações Completas", 
        completed: totalMessages >= 50, 
        date: totalMessages >= 50 ? "Recentemente" : "Em progresso" 
      },
      { 
        milestone: "Nível 3 Desbloqueado", 
        completed: userLevel >= 3, 
        date: userLevel >= 3 ? "Conquistado" : "Próximo destino" 
      },
    ]

    // Calculate completion rate
    const completionRate = totalMessages > 0 ? Math.min(95, (totalMessages * 5) + 50) : 0

    logger.info({ 
      userId: user.id, 
      totalConversations, 
      totalMessages, 
      currentStreak 
    }, 'Dashboard stats requested')

    return NextResponse.json({
      ok: true,
      data: {
        stats: {
          currentStreak,
          messagesToday,
          totalMessages,
          userLevel,
          completionRate
        },
        weeklyMood,
        weeklyActivity,
        achievements,
        timeStats: {
          totalTime: `${Math.floor(totalMessages * 2.5)}h ${(totalMessages * 30) % 60}m`,
          weeklyMessages: recentMessages.length,
          averageDaily: Math.round(recentMessages.length / 7)
        }
      }
    })
  } catch (error) {
    logger.error({ error }, 'Failed to get dashboard stats')
    return NextResponse.json(
      { ok: false, error: 'Failed to get dashboard stats' },
      { status: 500 }
    )
  }
}