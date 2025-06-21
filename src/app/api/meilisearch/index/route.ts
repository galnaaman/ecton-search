import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'

export async function POST(request: NextRequest) {
  try {
    const { indexName, primaryKey } = await request.json()

    if (!indexName) {
      return NextResponse.json(
        { error: 'Index name is required' },
        { status: 400 }
      )
    }

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const task = await client.createIndex(indexName, {
      primaryKey: primaryKey || 'id'
    })

    return NextResponse.json({
      message: 'Index created successfully',
      task: {
        taskUid: task.taskUid,
        indexUid: task.indexUid,
        status: task.status,
        type: task.type
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating index:', error)
    return NextResponse.json(
      { error: 'Failed to create index', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const indexName = searchParams.get('name')

    if (!indexName) {
      return NextResponse.json(
        { error: 'Index name is required' },
        { status: 400 }
      )
    }

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    await client.deleteIndex(indexName)

    return NextResponse.json({
      message: `Index '${indexName}' deleted successfully`
    })

  } catch (error: any) {
    console.error('Error deleting index:', error)
    return NextResponse.json(
      { error: 'Failed to delete index', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const indexName = searchParams.get('name')

    if (!indexName) {
      return NextResponse.json(
        { error: 'Index name is required' },
        { status: 400 }
      )
    }

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const index = client.index(indexName)
    const stats = await index.getStats()

    return NextResponse.json({
      indexName,
      stats
    })

  } catch (error: any) {
    console.error('Error getting index stats:', error)
    return NextResponse.json(
      { error: 'Failed to get index stats', details: error.message },
      { status: 500 }
    )
  }
} 