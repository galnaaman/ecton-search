import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, canManageCMS } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user || !canManageCMS(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [apps, total] = await Promise.all([
      prisma.app.findMany({
        include: {
          createdByUser: {
            select: { username: true }
          }
        },
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.app.count()
    ])

    return NextResponse.json({
      apps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('Error fetching apps:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user || !canManageCMS(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, icon, url, color, description, order, isActive } = await request.json()

    if (!name || !icon || !url || !color) {
      return NextResponse.json(
        { error: 'Name, icon, URL, and color are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const app = await prisma.app.create({
      data: {
        name,
        icon,
        url,
        color,
        description: description || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: user.id
      },
      include: {
        createdByUser: {
          select: { username: true }
        }
      }
    })

    return NextResponse.json({
      message: 'App created successfully',
      app
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating app:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}