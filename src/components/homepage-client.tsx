'use client'

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DockBar } from "@/components/ui/dock-bar"
import { SearchInput, SearchInputRef } from "@/components/search-input"
import { SparklesCore } from "@/components/ui/sparkles"
import { Spotlight } from "@/components/ui/spotlight"
import { FloatingDock } from "@/components/ui/floating-dock"
import * as LucideIcons from 'lucide-react'

interface App {
  id: string
  name: string
  icon: string
  url: string
  color: string
  order: number
}

interface DockItem {
  id: string
  title: string
  icon: string
  href: string
  order: number
}

interface HomePageClientProps {
  apps: App[]
  dockItems: DockItem[]
}

export default function HomePageClient({ apps, dockItems }: HomePageClientProps) {
  const [showAppsGrid, setShowAppsGrid] = useState(false)
  const router = useRouter()
  const searchInputRef = useRef<SearchInputRef>(null)

  const handleNetworkSearch = () => {
    searchInputRef.current?.performSearch()
  }

  const handleLuckySearch = () => {
    const query = searchInputRef.current?.getSearchQuery()
    if (query?.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&lucky=true`)
    } else {
      router.push('/search?lucky=true')
    }
  }

  const toggleAppsGrid = () => {
    setShowAppsGrid(!showAppsGrid)
  }

  // Convert DockItem data to FloatingDock format
  const dockItemsFormatted = dockItems.map((item) => {
    // Render Lucide icon
    const renderIcon = (iconName: string) => {
      try {
        const IconComponent = (LucideIcons as any)[iconName]
        if (IconComponent) {
          return <IconComponent className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        }
        return <span className="text-sm">{iconName}</span>
      } catch {
        return <span className="text-sm">{iconName}</span>
      }
    }

    return {
      title: item.title,
      icon: renderIcon(item.icon),
      href: item.href,
    }
  })

  return (
    <div className="min-h-screen bg-[#202124] text-white flex flex-col relative overflow-hidden">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      {/* Header */}
      <header className="flex justify-end items-center p-4 space-x-4 relative z-20">
        <a href="#" className="text-sm text-gray-300 hover:underline">
          Gmail
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
          <Image 
            src="/profile-photo.jpg" 
            alt="Profile" 
            width={32}
            height={32}
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
              {apps.map((app) => (
                <a
                  key={app.id}
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
            {apps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No apps configured yet
              </div>
            )}
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

      {/* Dock Bar - Floating */}
      <DockBar 
        type="success"
        title="New"
        message="update v1.2.0 is live"
        onClose={() => console.log("Dock bar closed")}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        {/* Logo with Sparkles */}
        <div className="mb-8 relative">
          {/* Sparkles Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="tsparticlesfullpage"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#FFFFFF"
              speed={0.5}
            />
          </div>
          
          {/* Ecton Text */}
          <h1 className="relative z-20 text-9xl md:text-[12rem] font-normal text-white tracking-tight" style={{ 
            fontFamily: 'Product Sans, Google Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 400,
            letterSpacing: '-0.02em'
          }}>
            Ecton
          </h1>
        </div>

        {/* Search Box with Autocomplete */}
        <div className="w-full max-w-[584px] mb-8">
          <SearchInput 
            ref={searchInputRef}
            variant="homepage"
            showIcons={true}
          />
        </div>

        {/* Search Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button
            onClick={handleNetworkSearch}
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
      <footer className="bg-[#171717] px-8 py-4 relative z-10">
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
              <a href="/developer" className="text-gray-400 text-sm hover:underline">
                Developer Portal
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Dock - Quick Access */}
      {dockItemsFormatted.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <FloatingDock
            items={dockItemsFormatted}
            desktopClassName="bg-black/20 backdrop-blur-md border border-white/10"
            mobileClassName="bg-black/20 backdrop-blur-md border border-white/10"
          />
        </div>
      )}
    </div>
  )
}