import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'

export async function POST(request: NextRequest) {
  try {
    const { indexName, documents } = await request.json()

    if (!indexName) {
      return NextResponse.json(
        { error: 'Index name is required' },
        { status: 400 }
      )
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'Documents array is required and must not be empty' },
        { status: 400 }
      )
    }

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const index = client.index(indexName)
    const task = await index.addDocuments(documents)

    return NextResponse.json({
      message: `Successfully added ${documents.length} documents to index '${indexName}'`,
      task: {
        taskUid: task.taskUid,
        indexUid: task.indexUid,
        status: task.status,
        type: task.type
      },
      documentsCount: documents.length
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error adding documents:', error)
    return NextResponse.json(
      { error: 'Failed to add documents', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { indexName, documentIds } = await request.json()

    if (!indexName) {
      return NextResponse.json(
        { error: 'Index name is required' },
        { status: 400 }
      )
    }

    if (!documentIds || (!Array.isArray(documentIds) && typeof documentIds !== 'string')) {
      return NextResponse.json(
        { error: 'Document IDs are required (string or array)' },
        { status: 400 }
      )
    }

    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const index = client.index(indexName)
    let task

    if (Array.isArray(documentIds)) {
      task = await index.deleteDocuments(documentIds)
    } else {
      task = await index.deleteDocument(documentIds)
    }

    return NextResponse.json({
      message: `Successfully deleted documents from index '${indexName}'`,
      task: {
        taskUid: task.taskUid,
        indexUid: task.indexUid,
        status: task.status,
        type: task.type
      }
    })

  } catch (error: any) {
    console.error('Error deleting documents:', error)
    return NextResponse.json(
      { error: 'Failed to delete documents', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const indexName = searchParams.get('index')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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
    const documents = await index.getDocuments({
      limit,
      offset
    })

    return NextResponse.json({
      indexName,
      documents: documents.results,
      pagination: {
        limit,
        offset,
        total: documents.total
      }
    })

  } catch (error: any) {
    console.error('Error getting documents:', error)
    return NextResponse.json(
      { error: 'Failed to get documents', details: error.message },
      { status: 500 }
    )
  }
} 