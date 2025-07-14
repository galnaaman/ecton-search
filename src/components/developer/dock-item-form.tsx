'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as LucideIcons from 'lucide-react'

interface DockItem {
  id: string
  title: string
  icon: string
  href: string
  order: number
  isActive: boolean
}

interface DockItemFormProps {
  dockItem?: DockItem
  onSave: (dockItem: Omit<DockItem, 'id'>) => void
  onCancel: () => void
  loading?: boolean
}

const popularIcons = [
  'Home', 'Search', 'FileText', 'Users', 'Calendar', 'Mail', 'Database', 
  'HelpCircle', 'Shield', 'Settings', 'Globe', 'Monitor', 'Smartphone',
  'Laptop', 'Server', 'Cloud', 'Lock', 'Unlock', 'Bell', 'MessageCircle',
  'Phone', 'Video', 'Music', 'Image', 'Upload', 'Download'
]

export function DockItemForm({ dockItem, onSave, onCancel, loading = false }: DockItemFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    icon: 'Home',
    href: '',
    order: 0,
    isActive: true
  })

  useEffect(() => {
    if (dockItem) {
      setFormData({
        title: dockItem.title,
        icon: dockItem.icon,
        href: dockItem.href,
        order: dockItem.order,
        isActive: dockItem.isActive
      })
    }
  }, [dockItem])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const renderIcon = (iconName: string) => {
    try {
      const IconComponent = (LucideIcons as any)[iconName]
      if (IconComponent) {
        return <IconComponent className="h-5 w-5" />
      }
      return <span className="text-xs">{iconName}</span>
    } catch {
      return <span className="text-xs">{iconName}</span>
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter dock item title"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="href" className="block text-sm font-medium text-gray-700 mb-1">
              Link (URL or Path) *
            </label>
            <Input
              id="href"
              name="href"
              type="text"
              value={formData.href}
              onChange={handleChange}
              required
              placeholder="/dashboard or https://example.com"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use relative paths (e.g., /settings) for internal links or full URLs for external links
            </p>
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <Input
              id="order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (visible to users)
            </label>
          </div>
        </div>

        {/* Icon Selection */}
        <div className="space-y-4">
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
              Icon (Lucide Icon Name) *
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="icon"
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                required
                placeholder="Home"
                className="flex-1"
              />
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {renderIcon(formData.icon)}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Popular Icons:</p>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {popularIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 border rounded hover:bg-gray-50 flex items-center justify-center ${
                    formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  title={icon}
                >
                  {renderIcon(icon)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Visit{' '}
              <a 
                href="https://lucide.dev/icons" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                lucide.dev/icons
              </a>
              {' '}for more icons
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-fit">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {renderIcon(formData.icon)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{formData.title || 'Dock Item'}</div>
            <div className="text-xs text-gray-600">{formData.href || 'No link'}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : (dockItem ? 'Update Dock Item' : 'Create Dock Item')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}