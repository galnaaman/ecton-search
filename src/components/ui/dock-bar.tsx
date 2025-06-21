'use client'

import { useState } from "react"
import { X } from "lucide-react"

interface DockBarProps {
  type?: 'info' | 'success' | 'warning' | 'update'
  title?: string
  message: string
  version?: string
  onClose?: () => void
  dismissible?: boolean
}

export function DockBar({ 
  type = 'info', 
  title = 'New', 
  message, 
  version,
  onClose,
  dismissible = true 
}: DockBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-black/30 border-white/20 text-white'
      case 'warning':
        return 'bg-black/30 border-white/20 text-white'
      case 'update':
        return 'bg-black/30 border-white/20 text-white'
      default:
        return 'bg-black/30 border-white/20 text-white'
    }
  }

  const getIndicatorColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'update':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 pointer-events-none">
      <div className={`
        relative flex items-center gap-3 px-6 py-3 rounded-full border 
        backdrop-blur-xl transition-all duration-300 ease-in-out
        before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r 
        before:from-white/5 before:to-transparent before:pointer-events-none
        max-w-lg w-auto pointer-events-auto
        shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]
        ${getTypeStyles()}
      `}>
        {/* Status Indicator */}
        <div className={`w-2.5 h-2.5 rounded-full ${getIndicatorColor()} relative z-10`} />
        
        {/* Content */}
        <div className="flex items-center gap-2 text-sm font-medium relative z-10">
          <span className="text-white">{title}</span>
          <span className="text-white/90">{message}</span>
        </div>

        {/* Close Button */}
        {dismissible && (
          <button
            onClick={handleClose}
            className="ml-2 text-white/60 hover:text-white transition-colors relative z-10"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
} 