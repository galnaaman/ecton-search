'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/developer/sidebar'
import { AnalyticsChart } from '@/components/developer/analytics-chart'
import { ArrowLeft, Download, RefreshCw, TrendingUp, Search, AlertCircle } from 'lucide-react'

interface Analytics {
  overview: {
    totalSearches: number
    uniqueQueries: number
    avgResultsPerQuery: number
    dateRange: {
      start: string
      end: string
      days: number
    }
  }
  searchVolume: Array<{ date: string; count: number }>
  topQueries: Array<{ query: string; count: number; avg_results: number }>
  noResultQueries: Array<{ query: string; count: number }>
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [exporting, setExporting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/developer')
      return
    }

    setUser(JSON.parse(userData))
    fetchAnalytics()
  }, [router, days])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/developer')
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/developer/analytics?days=${days}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/developer')
          return
        }
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      alert('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(true)
      const response = await fetch('/api/developer/analytics', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ format, days })
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `search-analytics-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `search-analytics-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const prepareChartData = () => {
    if (!analytics) return null

    const sortedVolume = [...analytics.searchVolume].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return {
      labels: sortedVolume.map(item => 
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        label: 'Searches',
        data: sortedVolume.map(item => Number(item.count)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      }]
    }
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const chartData = prepareChartData()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {user && <Sidebar user={user} onLogout={handleLogout} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Search Analytics
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <Button
                  onClick={() => fetchAnalytics()}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {analytics && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Searches</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.totalSearches.toLocaleString()}
                    </p>
                  </div>
                  <Search className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Unique Queries</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overview.uniqueQueries.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Results/Query</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(analytics.overview.avgResultsPerQuery)}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Search Volume Chart */}
            {chartData && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Search Volume</h2>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleExport('csv')}
                      variant="outline"
                      size="sm"
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      onClick={() => handleExport('json')}
                      variant="outline"
                      size="sm"
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                </div>
                <AnalyticsChart data={chartData} type="line" height={300} />
              </div>
            )}

            {/* Top Queries and No Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Queries */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Queries</h2>
                <div className="space-y-2">
                  {analytics.topQueries.map((query, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{query.query}</p>
                        <p className="text-xs text-gray-500">
                          {Number(query.count)} searches • {Math.round(Number(query.avg_results))} avg results
                        </p>
                      </div>
                    </div>
                  ))}
                  {analytics.topQueries.length === 0 && (
                    <p className="text-gray-500 text-sm">No queries found</p>
                  )}
                </div>
              </div>

              {/* Queries with No Results */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">No Results Queries</h2>
                <div className="space-y-2">
                  {analytics.noResultQueries.map((query, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{query.query}</p>
                        <p className="text-xs text-gray-500">{Number(query.count)} searches</p>
                      </div>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </div>
                  ))}
                  {analytics.noResultQueries.length === 0 && (
                    <p className="text-gray-500 text-sm">No queries without results</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        </main>
      </div>
    </div>
  )
}