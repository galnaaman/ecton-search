import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const indexName = searchParams.get('index') || 'internal_sites'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter')

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const index = client.index(indexName)
    
    const searchOptions: any = {
      limit,
      offset,
      attributesToHighlight: ['name', 'description'],
      attributesToRetrieve: ['id', 'name', 'url', 'description', 'type']
    }

    if (filter) {
      searchOptions.filter = filter
    }

    const searchResponse = await index.search(query, searchOptions)

    // Track search analytics
    if (query && query.trim()) {
      const userIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      const userAgent = request.headers.get('user-agent') || null
      
      await prisma.searchAnalytics.create({
        data: {
          query: query.trim(),
          resultsCount: searchResponse.estimatedTotalHits || 0,
          userIp,
          userAgent
        }
      }).catch(err => {
        console.error('Failed to track search analytics:', err)
      })
    }

    return NextResponse.json({
      query,
      indexName,
      hits: searchResponse.hits,
      processingTimeMs: searchResponse.processingTimeMs,
      limit: searchResponse.limit,
      offset: searchResponse.offset,
      estimatedTotalHits: searchResponse.estimatedTotalHits,
      totalHits: searchResponse.totalHits,
      totalPages: searchResponse.totalPages,
      hitsPerPage: searchResponse.hitsPerPage,
      page: searchResponse.page,
      facetDistribution: searchResponse.facetDistribution
    })

  } catch (error: any) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      query = '', 
      indexName = 'internal_sites', 
      limit = 10, 
      offset = 0,
      filter,
      sort,
      facets,
      attributesToHighlight,
      attributesToRetrieve 
    } = await request.json()

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const index = client.index(indexName)
    
    const searchOptions: any = {
      limit,
      offset,
      attributesToHighlight: attributesToHighlight || ['name', 'description'],
      attributesToRetrieve: attributesToRetrieve || ['id', 'name', 'url', 'description', 'type']
    }

    if (filter) searchOptions.filter = filter
    if (sort) searchOptions.sort = sort
    if (facets) searchOptions.facets = facets

    const searchResponse = await index.search(query, searchOptions)

    // Track search analytics
    if (query && query.trim()) {
      const userIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
      const userAgent = request.headers.get('user-agent') || null
      
      await prisma.searchAnalytics.create({
        data: {
          query: query.trim(),
          resultsCount: searchResponse.estimatedTotalHits || 0,
          userIp,
          userAgent
        }
      }).catch(err => {
        console.error('Failed to track search analytics:', err)
      })
    }

    return NextResponse.json({
      query,
      indexName,
      hits: searchResponse.hits,
      processingTimeMs: searchResponse.processingTimeMs,
      limit: searchResponse.limit,
      offset: searchResponse.offset,
      estimatedTotalHits: searchResponse.estimatedTotalHits,
      totalHits: searchResponse.totalHits,
      totalPages: searchResponse.totalPages,
      hitsPerPage: searchResponse.hitsPerPage,
      page: searchResponse.page,
      facetDistribution: searchResponse.facetDistribution
    })

  } catch (error: any) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search', details: error.message },
      { status: 500 }
    )
  }
} 