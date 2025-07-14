'use client'

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import { useRouter } from "next/navigation"
import { Search, Camera, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"

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
  className,
  showIcons = false
}, ref) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  
  const placeholders = [
    "Search for company documents",
    "Find employee contact information",
    "Look up Q4 financial reports",
    "Search the IT knowledge base",
    "Find project files and assets"
  ]

  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 1) {
        fetchSuggestions(searchQuery)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/meilisearch/search?q=${encodeURIComponent(query)}&limit=8`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.hits && Array.isArray(data.hits)) {
          setSuggestions(data.hits)
          setShowSuggestions(data.hits.length > 0)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = useCallback((queryOverride?: string) => {
    const finalQuery = queryOverride || searchQuery
    if (finalQuery.trim()) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`)
    }
  }, [searchQuery, router])

  useImperativeHandle(ref, () => ({
    getSearchQuery: () => searchQuery,
    performSearch: handleSearch
  }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex]
          handleSearch(selectedSuggestion.name)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const selectedSuggestion = suggestions[selectedIndex]
      handleSearch(selectedSuggestion.name)
    } else {
      handleSearch()
    }
  }

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const selectedSuggestion = suggestions[selectedIndex]
      handleSearch(selectedSuggestion.name)
    } else {
      handleSearch()
    }
  }, [selectedIndex, suggestions, handleSearch])

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.name)
  }

  const isHomepage = variant === 'homepage'

  return (
    <div className={cn("relative w-full", className)} ref={autocompleteRef}>
      <div className="relative">
        <PlaceholdersAndVanishInput 
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={handleFormSubmit}
          onKeyDown={handleKeyDown}
          value={searchQuery}
        />
        
        {showIcons && isHomepage && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-3 z-50">
            <button className="hover:bg-gray-200 p-2 rounded-full">
              <Mic className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
            <button className="hover:bg-gray-200 p-2 rounded-full">
              <Camera className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50",
          isHomepage ? "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]" : "shadow-md"
        )}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={cn(
                "px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0",
                "hover:bg-gray-50 transition-colors",
                selectedIndex === index ? "bg-gray-50" : ""
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center space-x-3">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">
                    {suggestion.name}
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {suggestion.type}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              Loading suggestions...
            </div>
          )}
        </div>
      )}
    </div>
  )
})

SearchInput.displayName = 'SearchInput' 