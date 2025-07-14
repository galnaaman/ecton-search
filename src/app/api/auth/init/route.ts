import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDefaultAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Create default admin user
    await createDefaultAdmin()

    // Check if we need to migrate existing sites from Meilisearch
    const siteCount = await prisma.site.count()
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      hasDefaultAdmin: true,
      siteCount
    })

  } catch (error: any) {
    console.error('Init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    )
  }
}