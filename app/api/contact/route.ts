import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/src/server/lib/logger'

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  source: z.enum(['WEBSITE', 'APP', 'REFERRAL']).default('WEBSITE'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ContactSchema.parse(body)

    const { prisma } = await import('@/src/server/db')

    const contact = await prisma.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        source: validatedData.source as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    })

    // TODO: Send notification email to admin
    
    logger.info({ 
      contactId: contact.id,
      email: contact.email,
      source: validatedData.source 
    }, 'New contact form submission')

    return NextResponse.json({
      ok: true,
      data: { 
        contact,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Failed to create contact')
    return NextResponse.json(
      { ok: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}