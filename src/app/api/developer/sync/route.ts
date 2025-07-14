import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'
import { MeiliSearch } from 'meilisearch'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const indexName = 'internal_sites'
    const index = client.index(indexName)

    // Get all sites from database
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        type: true
      }
    })

    // Clear existing documents
    await index.deleteAllDocuments()

    // Add new documents
    if (sites.length > 0) {
      await index.addDocuments(sites)
    }

    // Configure searchable attributes
    await index.updateSearchableAttributes([
      'name',
      'url',
      'description',
      'type'
    ])

    // Configure filterable attributes
    await index.updateFilterableAttributes(['type'])

    return NextResponse.json({
      message: 'Meilisearch synchronized successfully',
      syncedCount: sites.length
    })

  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    )
  }
}