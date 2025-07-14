import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim() === '' || query.length < 2) {
      return NextResponse.json([query || '', []])
    }

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const index = client.index('internal_sites')
    
    const searchResponse = await index.search(query.trim(), {
      limit: 8,
      attributesToRetrieve: ['name', 'description'],
      attributesToHighlight: []
    })

    const suggestions = searchResponse.hits.map((hit: any) => hit.name)

    return NextResponse.json([
      query,
      suggestions,
      [],
      []
    ])

  } catch (error: any) {
    console.error('OpenSearch suggestions error:', error)
    
    const { searchParams } = new URL(request.url)
    const fallbackQuery = searchParams.get('q')
    
    return NextResponse.json([
      fallbackQuery || '',
      []
    ])
  }
} 