'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Camera, Mic, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAppsGrid, setShowAppsGrid] = useState(false)
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

  const toggleAppsGrid = () => {
    setShowAppsGrid(!showAppsGrid)
  }

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

  return (
    <div className="min-h-screen bg-[#202124] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-end items-center p-4 space-x-4 relative">
        <a href="#" className="text-sm text-gray-300 hover:underline">
          Gmail
        </a>
        <a href="#" className="text-sm text-gray-300 hover:underline">
          Images
        </a>
        
        {/* Apps Grid Button */}
        <button 
          onClick={toggleAppsGrid}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors relative"
          aria-label="Google apps"
        >
          <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-gray-300 rounded-sm"></div>
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

        {/* Apps Grid Dropdown */}
        {showAppsGrid && (
          <div className="absolute top-14 right-4 bg-white rounded-lg shadow-2xl border p-4 z-50 w-80">
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
