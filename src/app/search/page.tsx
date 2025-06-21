'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchResult } from "../types"
import { SearchInput } from "@/components/search-input"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAppsGrid, setShowAppsGrid] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [searchStats, setSearchStats] = useState<{
    totalHits: number
    processingTime: number
  }>({ totalHits: 0, processingTime: 0 })

  const organizationApps = [
    { name: "Portal", icon: "🏢", url: "https://portal.internal.company.com", color: "bg-blue-500" },
    { name: "Finance", icon: "💰", url: "https://finance.internal.company.com", color: "bg-green-500" },
    { name: "CRM", icon: "👥", url: "https://crm.internal.company.com", color: "bg-purple-500" },
    { name: "Documents", icon: "📄", url: "https://docs.internal.company.com", color: "bg-orange-500" },
    { name: "Help Desk", icon: "🎧", url: "https://helpdesk.internal.company.com", color: "bg-red-500" },
    { name: "Calendar", icon: "📅", url: "https://calendar.internal.company.com", color: "bg-blue-600" },
    { name: "Mail", icon: "✉️", url: "https://mail.internal.company.com", color: "bg-gray-600" },
    { name: "Wiki", icon: "📖", url: "https://wiki.internal.company.com", color: "bg-yellow-500" },
    { name: "Monitoring", icon: "📊", url: "https://monitoring.internal.company.com", color: "bg-indigo-500" }
  ]

  const initialQuery = searchParams.get('q') || ""

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    } else {
      checkAndInitializeIndex()
    }
  }, [initialQuery])

  const checkAndInitializeIndex = async () => {
    try {
      const response = await fetch('/api/meilisearch/index?name=internal_sites')
      
      if (!response.ok && response.status === 500) {
        console.log("Index not found, attempting to initialize...")
        const initResponse = await fetch('/api/meilisearch/init', {
          method: 'POST'
        })
        
        if (initResponse.ok) {
          console.log("Meilisearch index initialized successfully!")
        }
      }
    } catch (error) {
      console.log("Could not connect to Meilisearch. Make sure it's running on localhost:7700")
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchStats({ totalHits: 0, processingTime: 0 })
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      const response = await fetch(`/api/meilisearch/search?q=${encodeURIComponent(query)}&limit=20`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const searchData = await response.json()
      const processingTime = Date.now() - startTime
      
      setSearchResults(searchData.hits || [])
      setSearchStats({
        totalHits: searchData.estimatedTotalHits || searchData.hits?.length || 0,
        processingTime: searchData.processingTimeMs || processingTime
      })
    } catch (error: any) {
      console.error("Search error:", error)
      setSearchResults([])
      setSearchStats({ totalHits: 0, processingTime: 0 })
      
      if (error.message.includes('500') || error.message.includes('index')) {
        console.log("Search failed, attempting to initialize Meilisearch...")
        try {
          const initResponse = await fetch('/api/meilisearch/init', { method: 'POST' })
          if (initResponse.ok) {
            console.log("Meilisearch initialized! You can now search again.")
            setTimeout(() => {
              performSearch(query)
            }, 1000)
          }
        } catch (initError) {
          console.error("Failed to initialize Meilisearch:", initError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAppsGrid = () => {
    setShowAppsGrid(!showAppsGrid)
  }

  const handleManualInit = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch('/api/meilisearch/init', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        console.log("Meilisearch initialized successfully:", data)
        setTimeout(() => {
          performSearch("portal")
        }, 500)
      } else {
        const errorData = await response.json()
        console.error("Initialization failed:", errorData)
        alert(`Failed to initialize: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Initialization error:", error)
      alert("Failed to initialize. Make sure Meilisearch is running on localhost:7700")
    } finally {
      setIsInitializing(false)
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 relative">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <span className="text-2xl font-normal text-[#4285f4]">Internal Search</span>
              </Link>
              
              <div className="flex-1 max-w-2xl">
                <SearchInput 
                  variant="header"
                  initialQuery={initialQuery}
                  placeholder="Search your network..."
                />
              </div>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Gmail
              </a>
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Images
              </a>
              
              {/* Apps Grid Button */}
              <button 
                onClick={toggleAppsGrid}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-label="Company apps"
              >
                <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-gray-600 rounded-sm"></div>
                  ))}
                </div>
              </button>

              {/* Profile Picture */}
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer hover:shadow-lg transition-shadow">
                <img 
                  src="/placeholder.svg?height=32&width=32&query=professional+profile+photo" 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid Dropdown */}
        {showAppsGrid && (
          <div className="absolute top-14 right-6 bg-white rounded-lg shadow-2xl border p-4 z-50 w-80">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-sm font-medium">Company Apps</span>
              <button 
                onClick={toggleAppsGrid}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {organizationApps.map((app, index) => (
                <a
                  key={index}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className={`w-12 h-12 ${app.color} rounded-full flex items-center justify-center mb-2 text-white text-xl group-hover:scale-110 transition-transform`}>
                    {app.icon}
                  </div>
                  <span className="text-xs text-gray-700 text-center font-medium">
                    {app.name}
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a 
                href="#" 
                className="text-blue-600 text-sm hover:underline"
              >
                More apps →
              </a>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {showAppsGrid && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowAppsGrid(false)}
          ></div>
        )}

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
        {initialQuery && (
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
          ) : initialQuery && !isLoading ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl mb-4">No results found for &quot;{initialQuery}&quot;</div>
              <div className="text-gray-400 text-sm space-y-2">
                <div>Make sure all words are spelled correctly.</div>
                <div>Try different keywords.</div>
                <div>Try more general keywords.</div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-700 text-sm">
                    💡 <strong>Tip:</strong> Search for terms like &quot;portal&quot;, &quot;finance&quot;, &quot;documents&quot;, or &quot;help&quot;
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Empty State for no query */}
        {!initialQuery && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <div className="text-gray-500 text-xl mb-2">Start your search</div>
            <div className="text-gray-400 text-sm mb-6">
              Enter a search term to find resources across your network
            </div>
            <div className="p-6 bg-gray-50 rounded-lg max-w-md mx-auto">
              <div className="text-gray-700 text-sm mb-4">
                🚀 <strong>First time here?</strong> Initialize the search database with sample data
              </div>
              <Button 
                onClick={handleManualInit}
                disabled={isInitializing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isInitializing ? "Initializing..." : "Initialize Search Data"}
              </Button>
              <div className="text-gray-500 text-xs mt-2">
                This will set up sample internal company resources
              </div>
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