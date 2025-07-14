import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '10')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get search volume over time
    const searchVolume = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM search_analytics
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    // Get top queries
    const topQueries = await prisma.$queryRaw<Array<{ query: string; count: bigint; avg_results: number }>>`
      SELECT 
        query,
        COUNT(*) as count,
        AVG(results_count) as avg_results
      FROM search_analytics
      WHERE created_at >= ${startDate}
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `

    // Get queries with no results
    const noResultQueries = await prisma.$queryRaw<Array<{ query: string; count: bigint }>>`
      SELECT 
        query,
        COUNT(*) as count
      FROM search_analytics
      WHERE results_count = 0 AND created_at >= ${startDate}
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `

    // Get total metrics
    const totalSearches = await prisma.searchAnalytics.count({
      where: {
        createdAt: { gte: startDate }
      }
    })

    const uniqueQueries = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT query) as count
      FROM search_analytics
      WHERE created_at >= ${startDate}
    `

    const avgResultsPerQuery = await prisma.$queryRaw<[{ avg: number | null }]>`
      SELECT AVG(results_count) as avg
      FROM search_analytics
      WHERE created_at >= ${startDate}
    `

    return NextResponse.json({
      overview: {
        totalSearches,
        uniqueQueries: Number(uniqueQueries[0].count),
        avgResultsPerQuery: avgResultsPerQuery[0].avg || 0,
        dateRange: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          days
        }
      },
      searchVolume: searchVolume.map(item => ({
        date: item.date.toISOString().split('T')[0],
        count: Number(item.count)
      })),
      topQueries: topQueries.map(item => ({
        query: item.query,
        count: Number(item.count),
        avg_results: item.avg_results
      })),
      noResultQueries: noResultQueries.map(item => ({
        query: item.query,
        count: Number(item.count)
      }))
    })

  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export analytics data
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { format = 'json', days = 30 } = await request.json()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const analytics = await prisma.searchAnalytics.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Query', 'Results Count', 'User IP', 'User Agent']
      const rows = analytics.map(record => [
        record.createdAt.toISOString(),
        record.query,
        record.resultsCount.toString(),
        record.userIp || '',
        record.userAgent || ''
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="search-analytics-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default to JSON
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      },
      recordCount: analytics.length,
      data: analytics
    })

  } catch (error: any) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}