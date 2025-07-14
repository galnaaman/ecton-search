import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim() === '') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const searchUrl = new URL('/search', request.url)
    searchUrl.searchParams.set('q', query.trim())

    return NextResponse.redirect(searchUrl)

  } catch (error: any) {
    console.error('OpenSearch search error:', error)
    
    return NextResponse.redirect(new URL('/', request.url))
  }
} 