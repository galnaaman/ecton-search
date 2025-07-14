import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const site = await prisma.site.findUnique({
      where: { id: params.id },
      include: {
        createdByUser: {
          select: { username: true }
        }
      }
    })

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ site })

  } catch (error: any) {
    console.error('Error fetching site:', error)
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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, url, description, type } = await request.json()

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
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

    const existingSite = await prisma.site.findUnique({
      where: { id: params.id }
    })

    if (!existingSite) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    const site = await prisma.site.update({
      where: { id: params.id },
      data: {
        name,
        url,
        description: description || null,
        type: type || 'website'
      },
      include: {
        createdByUser: {
          select: { username: true }
        }
      }
    })

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'update',
        siteId: site.id,
        changes: {
          old: {
            name: existingSite.name,
            url: existingSite.url,
            description: existingSite.description,
            type: existingSite.type
          },
          new: { name, url, description, type }
        }
      }
    })

    return NextResponse.json({
      message: 'Site updated successfully',
      site
    })

  } catch (error: any) {
    console.error('Error updating site:', error)
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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingSite = await prisma.site.findUnique({
      where: { id: params.id }
    })

    if (!existingSite) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    await prisma.site.delete({
      where: { id: params.id }
    })

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete',
        siteId: params.id,
        changes: {
          deleted: {
            name: existingSite.name,
            url: existingSite.url,
            description: existingSite.description,
            type: existingSite.type
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Site deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting site:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}