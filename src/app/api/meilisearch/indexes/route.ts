import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'

export async function GET(request: NextRequest) {
  try {
    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const indexes = await client.getIndexes()

    return NextResponse.json({
      indexes: indexes.results.map(index => ({
        uid: index.uid,
        primaryKey: index.primaryKey,
        createdAt: index.createdAt,
        updatedAt: index.updatedAt
      })),
      total: indexes.total
    })

  } catch (error: any) {
    console.error('Error getting indexes:', error)
    return NextResponse.json(
      { error: 'Failed to get indexes', details: error.message },
      { status: 500 }
    )
  }
} 