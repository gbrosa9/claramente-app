import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'
import { logger } from '@/src/server/lib/logger'

const RespondAssessmentSchema = z.object({
  answers: z.array(z.number()).min(1)
})

function calculateScore(answers: number[], scoringRules: any): { score: number; severity: string; description: string } {
  const score = answers.reduce((sum, answer) => sum + answer, 0)
  
  const ranges = scoringRules.ranges || []
  const range = ranges.find((r: any) => score >= r.min && score <= r.max)
  
  return {
    score,
    severity: range?.severity || 'Unknown',
    description: range?.description || 'No interpretation available'
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const body = await request.json()
    const validatedData = RespondAssessmentSchema.parse(body)
    const { id } = await params

    // Get assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id }
    })

    if (!assessment || !assessment.publishedAt) {
      return NextResponse.json(
        { ok: false, error: 'Assessment not found or not published' },
        { status: 404 }
      )
    }

    // Validate answers count
    const questions = (assessment.items as any)?.questions || []
    if (validatedData.answers.length !== questions.length) {
      return NextResponse.json(
        { ok: false, error: 'Invalid number of answers' },
        { status: 400 }
      )
    }

    // Calculate score
    const result = calculateScore(validatedData.answers, assessment.scoring)

    // Save result
    const assessmentResult = await prisma.assessmentResult.create({
      data: {
        userId: user.id,
        assessmentId: id,
        answers: validatedData.answers,
        score: result.score,
        severity: result.severity,
      },
      select: {
        id: true,
        score: true,
        severity: true,
        takenAt: true,
      }
    })

    // Generate recommendations based on severity
    const recommendations = generateRecommendations(result.severity, assessment.type)

    logger.info({ 
      userId: user.id, 
      assessmentId: id,
      score: result.score,
      severity: result.severity 
    }, 'Assessment completed')

    return NextResponse.json({
      ok: true,
      data: {
        result: {
          ...assessmentResult,
          description: result.description,
          recommendations
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Failed to respond to assessment')
    return NextResponse.json(
      { ok: false, error: 'Failed to respond to assessment' },
      { status: 500 }
    )
  }
}

function generateRecommendations(severity: string, assessmentType: string): string[] {
  const recommendations: string[] = []

  // Base recommendations
  recommendations.push('Continue monitorando seus sintomas regularmente')
  recommendations.push('Pratique técnicas de respiração e mindfulness')

  // Severity-specific recommendations
  if (severity === 'Leve') {
    recommendations.push('Considere técnicas de autocuidado e exercícios de TCC')
    recommendations.push('Mantenha uma rotina de sono regular')
  } else if (severity === 'Moderado') {
    recommendations.push('Recomendamos buscar apoio profissional')
    recommendations.push('Pratique exercícios físicos regulares')
    recommendations.push('Converse com pessoas de confiança sobre seus sentimentos')
  } else if (severity.includes('Severo')) {
    recommendations.push('É importante buscar ajuda profissional imediatamente')
    recommendations.push('Considere entrar em contato com nossa equipe de apoio')
    recommendations.push('Não hesite em procurar serviços de emergência se necessário')
  }

  // Assessment-specific recommendations
  if (assessmentType === 'PHQ9') {
    recommendations.push('Mantenha um diário de humor para identificar padrões')
  } else if (assessmentType === 'GAD7') {
    recommendations.push('Pratique técnicas de relaxamento muscular progressivo')
  }

  return recommendations
}