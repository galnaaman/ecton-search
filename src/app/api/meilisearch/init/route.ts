import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'
import { sampleData } from '@/lib/search-service'

export async function POST(request: NextRequest) {
  try {
    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const indexName = 'internal_sites'

    // Check if index already exists
    try {
      await client.getIndex(indexName)
      return NextResponse.json(
        { message: 'Index already exists with data. Use DELETE first if you want to reinitialize.' },
        { status: 409 }
      )
    } catch (error: any) {
      // Index doesn't exist, continue with creation
    }

    // Create the index
    const createTask = await client.createIndex(indexName, {
      primaryKey: 'id'
    })

    // Wait a moment for index creation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add the sample documents
    const index = client.index(indexName)
    const addTask = await index.addDocuments(sampleData)

    // Configure searchable attributes
    await index.updateSearchableAttributes([
      'name',
      'description',
      'type'
    ])

    // Configure filterable attributes
    await index.updateFilterableAttributes([
      'type'
    ])

    return NextResponse.json({
      message: 'Successfully initialized Meilisearch with sample data',
      indexName,
      documentsAdded: sampleData.length,
      tasks: {
        createIndex: {
          taskUid: createTask.taskUid,
          status: createTask.status
        },
        addDocuments: {
          taskUid: addTask.taskUid,
          status: addTask.status
        }
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error initializing Meilisearch:', error)
    return NextResponse.json(
      { error: 'Failed to initialize Meilisearch', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
    })

    const indexName = 'internal_sites'

    try {
      await client.deleteIndex(indexName)
      return NextResponse.json({
        message: 'Successfully deleted the internal_sites index'
      })
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Index not found or already deleted', details: error.message },
        { status: 404 }
      )
    }

  } catch (error: any) {
    console.error('Error deleting index:', error)
    return NextResponse.json(
      { error: 'Failed to delete index', details: error.message },
      { status: 500 }
    )
  }
} 