import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const dockItems = await prisma.dockItem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        icon: true,
        href: true,
        order: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ dockItems })

  } catch (error: any) {
    console.error('Error fetching dock items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}