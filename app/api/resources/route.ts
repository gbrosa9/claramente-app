import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const tag = searchParams.get('tag')
    const featured = searchParams.get('featured') === 'true'
    
    const skip = (page - 1) * limit

    const { prisma } = await import('@/src/server/db')

    const where: any = {
      publishedAt: { not: null }
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (featured) {
      where.featured = true
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          tags: true,
          featured: true,
          publishedAt: true,
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.resource.count({ where })
    ])

    return NextResponse.json({
      ok: true,
      data: {
        resources,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Failed to get resources:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to get resources' },
      { status: 500 }
    )
  }
}