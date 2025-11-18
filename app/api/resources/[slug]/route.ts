import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const { prisma } = await import('@/src/server/db')

    const resource = await prisma.resource.findUnique({
      where: { 
        slug: params.slug,
        publishedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        tags: true,
        featured: true,
        publishedAt: true,
        updatedAt: true,
      }
    })

    if (!resource) {
      return NextResponse.json(
        { ok: false, error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Get related resources (same tags)
    const relatedResources = await prisma.resource.findMany({
      where: {
        publishedAt: { not: null },
        id: { not: resource.id },
        tags: { hasSome: resource.tags }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        tags: true,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({
      ok: true,
      data: {
        resource,
        relatedResources
      }
    })
  } catch (error) {
    console.error('Failed to get resource:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to get resource' },
      { status: 500 }
    )
  }
}