import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, canManageCMS } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user || !canManageCMS(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dockItem = await prisma.dockItem.findUnique({
      where: { id: params.id },
      include: {
        createdByUser: {
          select: { username: true }
        }
      }
    })

    if (!dockItem) {
      return NextResponse.json(
        { error: 'Dock item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ dockItem })

  } catch (error: any) {
    console.error('Error fetching dock item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate href format
    if (!href.startsWith('/') && !href.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid href format' },
        { status: 400 }
      )
    }

    const existingDockItem = await prisma.dockItem.findUnique({
      where: { id: params.id }
    })

    if (!existingDockItem) {
      return NextResponse.json(
        { error: 'Dock item not found' },
        { status: 404 }
      )
    }

    const dockItem = await prisma.dockItem.update({
      where: { id: params.id },
      data: {
        title,
        icon,
        href,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        createdByUser: {
          select: { username: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Dock item updated successfully',
      dockItem
    })

  } catch (error: any) {
    console.error('Error updating dock item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user || !canManageCMS(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingDockItem = await prisma.dockItem.findUnique({
      where: { id: params.id }
    })

    if (!existingDockItem) {
      return NextResponse.json(
        { error: 'Dock item not found' },
        { status: 404 }
      )
    }

    await prisma.dockItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Dock item deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting dock item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}