'use client'

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import { useRouter } from "next/navigation"
import { Search, Camera, Mic } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchSuggestion {
  id: string
  name: string
  url: string
  type: string
  description?: string
}

interface SearchInputProps {
  variant?: 'homepage' | 'header'
  initialQuery?: string
  placeholder?: string
  className?: string
  showIcons?: boolean
}

export interface SearchInputRef {
  getSearchQuery: () => string
  performSearch: () => void
}

export const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(({ 
  variant = 'homepage', 
  initialQuery = '', 
  placeholder = "Search your network...",
  className,
  showIcons = false
}, ref) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }, [searchQuery, router])

  useImperativeHandle(ref, () => ({
    getSearchQuery: () => searchQuery,
    performSearch: handleSearch
  }))

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch(`/api/meilisearch/search?q=${encodeURIComponent(query)}&limit=8`)
      
      if (response.ok) {
        const searchData = await response.json()
        const suggestions: SearchSuggestion[] = searchData.hits?.map((hit: any) => ({
          id: hit.id,
          name: hit.name,
          url: hit.url,
          type: hit.type,
          description: hit.description
        })) || []
        
        setSuggestions(suggestions)
        setShowSuggestions(suggestions.length > 0)
        setSelectedSuggestionIndex(-1)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex]
          selectSuggestion(selectedSuggestion.name)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const selectSuggestion = (suggestionText: string) => {
    setSearchQuery(suggestionText)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    router.push(`/search?q=${encodeURIComponent(suggestionText)}`)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isHomepage = variant === 'homepage'
  const isHeader = variant === 'header'

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className={cn(
          "absolute left-4 top-1/2 transform -translate-y-1/2",
          isHomepage && "text-gray-400",
          isHeader && "text-gray-400"
        )}>
          <Search className="w-5 h-5" />
        </div>
        
        <Input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && searchQuery.length >= 2) {
              setShowSuggestions(true)
            }
          }}
          className={cn(
            "pl-12 text-base border-none rounded-full focus:outline-none",
            isHomepage && "w-full h-12 pr-24 bg-white text-black shadow-sm focus:shadow-md",
            isHeader && "w-full h-11 pr-12 border border-gray-300 focus:border-blue-500 focus:shadow-sm hover:shadow-sm"
          )}
          placeholder={placeholder}
          autoComplete="off"
        />
        
        {/* Icons for homepage variant */}
        {showIcons && isHomepage && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-3">
            <button className="hover:bg-gray-100 p-1 rounded">
              <Mic className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
            <button className="hover:bg-gray-100 p-1 rounded">
              <Camera className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}
        
        {/* Search icon for header variant */}
        {isHeader && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <button 
              onClick={handleSearch}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Search className="w-4 h-4 text-blue-500" />
            </button>
          </div>
        )}
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className={cn(
            "absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-1 z-50 overflow-hidden",
            isHomepage && "shadow-2xl",
            isHeader && "shadow-lg"
          )}
          style={{ boxShadow: '0 4px 6px rgba(32, 33, 36, 0.28)' }}
        >
          {isLoadingSuggestions ? (
            <div className="px-4 py-3 text-gray-500 text-sm flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Loading suggestions...</span>
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={cn(
                    "px-4 py-2 cursor-pointer flex items-center space-x-3 hover:bg-gray-50",
                    selectedSuggestionIndex === index && "bg-gray-50"
                  )}
                  onClick={() => selectSuggestion(suggestion.name)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 truncate">
                        {suggestion.name}
                      </span>
                      {suggestion.type && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          {suggestion.type}
                        </span>
                      )}
                    </div>
                    {suggestion.description && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Search suggestion */}
              <div
                className={cn(
                  "px-4 py-2 cursor-pointer flex items-center space-x-3 hover:bg-gray-50 border-t border-gray-100",
                  selectedSuggestionIndex === suggestions.length && "bg-gray-50"
                )}
                onClick={() => selectSuggestion(searchQuery)}
                onMouseEnter={() => setSelectedSuggestionIndex(suggestions.length)}
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">
                  Search for <strong>&quot;{searchQuery}&quot;</strong>
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})

SearchInput.displayName = 'SearchInput' 