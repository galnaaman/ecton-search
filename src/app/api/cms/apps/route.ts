import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const apps = await prisma.app.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        icon: true,
        url: true,
        color: true,
        description: true,
        order: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ apps })

  } catch (error: any) {
    console.error('Error fetching apps:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}