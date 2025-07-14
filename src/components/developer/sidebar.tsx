'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Globe, 
  BarChart, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Grid,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: {
    id: string
    username: string
    role: string
  }
  onLogout: () => void
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/developer/dashboard',
      icon: Home,
      roles: ['technical', 'admin']
    },
    {
      name: 'Sites',
      href: '/developer/dashboard',
      icon: Globe,
      roles: ['technical', 'admin']
    },
    {
      name: 'Analytics',
      href: '/developer/dashboard/analytics',
      icon: BarChart,
      roles: ['admin']
    },
    {
      name: 'Apps Grid',
      href: '/developer/dashboard/cms/apps',
      icon: Grid,
      roles: ['admin']
    },
    {
      name: 'Dock Items',
      href: '/developer/dashboard/cms/dock-items',
      icon: Monitor,
      roles: ['admin']
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  )

  const isActive = (href: string) => {
    if (href === '/developer/dashboard') {
      return pathname === '/developer/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Developer Portal</h2>
              <p className="text-sm text-gray-500">{user.username} ({user.role})</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "text-gray-700 hover:bg-gray-50",
                isCollapsed && "justify-center space-x-0"
              )}
            >
              <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "")} />
              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full flex items-center space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50",
            isCollapsed && "justify-center space-x-0"
          )}
        >
          <LogOut className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}