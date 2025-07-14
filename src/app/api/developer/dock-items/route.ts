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

    const [dockItems, total] = await Promise.all([
      prisma.dockItem.findMany({
        include: {
          createdByUser: {
            select: { username: true }
          }
        },
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.dockItem.count()
    ])

    return NextResponse.json({
      dockItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('Error fetching dock items:', error)
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

    const { title, icon, href, order, isActive } = await request.json()

    if (!title || !icon || !href) {
      return NextResponse.json(
        { error: 'Title, icon, and href are required' },
        { status: 400 }
      )
    }

    // Validate href format (can be relative or absolute URL)
    if (!href.startsWith('/') && !href.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid href format' },
        { status: 400 }
      )
    }

    const dockItem = await prisma.dockItem.create({
      data: {
        title,
        icon,
        href,
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
      message: 'Dock item created successfully',
      dockItem
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating dock item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}