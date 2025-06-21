'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Camera, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLuckySearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&lucky=true`)
    } else {
      router.push('/search?lucky=true')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-[#202124] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-end items-center p-4 space-x-4">
        <a href="#" className="text-sm text-gray-300 hover:underline">
          Gmail
        </a>
        <a href="#" className="text-sm text-gray-300 hover:underline">
          Images
        </a>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
          U
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-normal text-white tracking-wide">
            Internal Search
          </h1>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-[584px] mb-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full h-12 pl-12 pr-12 text-base bg-white text-black border-none rounded-full shadow-sm focus:shadow-md focus:outline-none"
              placeholder="Search your network..."
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-3">
              <button className="hover:bg-gray-100 p-1 rounded">
                <Mic className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
              <button className="hover:bg-gray-100 p-1 rounded">
                <Camera className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button
            onClick={handleSearch}
            variant="secondary"
            className="px-6 py-2 bg-[#303134] text-white border border-[#303134] hover:shadow-sm hover:border-gray-600 rounded"
          >
            Network Search
          </Button>
          <Button
            onClick={handleLuckySearch}
            variant="secondary"
            className="px-6 py-2 bg-[#303134] text-white border border-[#303134] hover:shadow-sm hover:border-gray-600 rounded"
          >
            I&apos;m Feeling Lucky
          </Button>
        </div>

        {/* Language Options */}
        <div className="text-sm text-gray-300">
          Search available in:{" "}
          <a href="#" className="text-blue-400 hover:underline">
            English
          </a>{" "}
          <a href="#" className="text-blue-400 hover:underline">
            עברית
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#171717] px-8 py-4">
        <div className="flex flex-col space-y-4">
          <div className="text-gray-400 text-sm">
            Internal Network Search
          </div>
          <div className="flex flex-col md:flex-row md:justify-between space-y-2 md:space-y-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 text-sm hover:underline">
                About
              </a>
              <a href="#" className="text-gray-400 text-sm hover:underline">
                Help
              </a>
              <a href="#" className="text-gray-400 text-sm hover:underline">
                Privacy
              </a>
              <a href="#" className="text-gray-400 text-sm hover:underline">
                Terms
              </a>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 text-sm hover:underline">
                Settings
              </a>
              <a href="#" className="text-gray-400 text-sm hover:underline">
                Admin
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
