'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Search, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SearchResult, SearchResponse } from "../types"
import { searchService, sampleData } from "@/lib/search-service"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchStats, setSearchStats] = useState<{
    totalHits: number
    processingTime: number
  }>({ totalHits: 0, processingTime: 0 })

  const initialQuery = searchParams.get('q') || ""

  useEffect(() => {
    setSearchQuery(initialQuery)
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    const startTime = Date.now()

    try {
      // For now, we'll use mock data that filters based on the query
      // Later, you'll replace this with actual Meilisearch calls
      const filteredResults = sampleData.filter((result: SearchResult) =>
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      )

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const processingTime = Date.now() - startTime
      
      setSearchResults(filteredResults)
      setSearchStats({
        totalHits: filteredResults.length,
        processingTime
      })
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      performSearch(searchQuery)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'website': return 'bg-blue-100 text-blue-800'
      case 'document': return 'bg-green-100 text-green-800'
      case 'system': return 'bg-purple-100 text-purple-800'
      case 'database': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-2xl font-normal text-[#4285f4]">Internal Search</span>
            </Link>
            
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-11 pl-12 pr-12 text-base border border-gray-300 rounded-full focus:border-blue-500 focus:shadow-sm hover:shadow-sm"
                  placeholder="Search your network..."
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Search className="w-4 h-4 text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button className="py-3 text-sm border-b-2 border-blue-500 text-blue-600 font-medium">
              All
            </button>
            <button className="py-3 text-sm text-gray-600 hover:text-gray-900">
              Images  
            </button>
            <button className="py-3 text-sm text-gray-600 hover:text-gray-900">
              Documents
            </button>
            <button className="py-3 text-sm text-gray-600 hover:text-gray-900">
              Systems
            </button>
            <button className="py-3 text-sm text-gray-600 hover:text-gray-900">
              More
            </button>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-2xl mx-auto px-6 py-4">
        {/* Search Stats */}
        {searchQuery && (
          <div className="text-gray-600 text-sm mb-6">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <span>
                About {searchStats.totalHits.toLocaleString()} results ({(searchStats.processingTime / 1000).toFixed(2)} seconds)
              </span>
            )}
          </div>
        )}

        {/* Results List */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div key={result.id} className="group">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="text-sm text-gray-700 truncate">
                        {new URL(result.url).hostname}
                      </div>
                      {result.type && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 border-gray-200">
                          {result.type}
                        </Badge>
                      )}
                    </div>
                    <div className="mb-1">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl text-blue-600 hover:underline font-normal leading-tight group-hover:underline"
                      >
                        {result.name}
                      </a>
                    </div>
                    <div className="text-green-700 text-sm mb-2 truncate">
                      {result.url}
                    </div>
                    {result.description && (
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {result.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : searchQuery && !isLoading ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl mb-4">No results found for &quot;{searchQuery}&quot;</div>
              <div className="text-gray-400 text-sm space-y-2">
                <div>Make sure all words are spelled correctly.</div>
                <div>Try different keywords.</div>
                <div>Try more general keywords.</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Empty State for no query */}
        {!searchQuery && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <div className="text-gray-500 text-xl mb-2">Start your search</div>
            <div className="text-gray-400 text-sm">
              Enter a search term to find resources across your network
            </div>
          </div>
        )}

        {/* Pagination would go here */}
        {searchResults.length > 0 && (
          <div className="flex items-center justify-center space-x-4 mt-12 pb-8">
            <button className="text-blue-600 hover:underline text-sm">Previous</button>
            <div className="flex space-x-2">
              <button className="w-10 h-10 bg-blue-600 text-white rounded text-sm">1</button>
              <button className="w-10 h-10 hover:bg-gray-100 rounded text-sm">2</button>
              <button className="w-10 h-10 hover:bg-gray-100 rounded text-sm">3</button>
              <button className="w-10 h-10 hover:bg-gray-100 rounded text-sm">4</button>
            </div>
            <button className="text-blue-600 hover:underline text-sm">Next</button>
          </div>
        )}
      </main>
    </div>
  )
} 