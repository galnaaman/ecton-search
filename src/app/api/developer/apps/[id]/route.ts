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

    const app = await prisma.app.findUnique({
      where: { id: params.id },
      include: {
        createdByUser: {
          select: { username: true }
        }
      }
    })

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ app })

  } catch (error: any) {
    console.error('Error fetching app:', error)
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

    const existingApp = await prisma.app.findUnique({
      where: { id: params.id }
    })

    if (!existingApp) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    const app = await prisma.app.update({
      where: { id: params.id },
      data: {
        name,
        icon,
        url,
        color,
        description: description || null,
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
      message: 'App updated successfully',
      app
    })

  } catch (error: any) {
    console.error('Error updating app:', error)
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

    const existingApp = await prisma.app.findUnique({
      where: { id: params.id }
    })

    if (!existingApp) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    await prisma.app.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'App deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting app:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}