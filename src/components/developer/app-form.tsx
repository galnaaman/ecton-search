'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface App {
  id: string
  name: string
  icon: string
  url: string
  color: string
  description: string | null
  order: number
  isActive: boolean
}

interface AppFormProps {
  app?: App
  onSave: (app: Omit<App, 'id'>) => void
  onCancel: () => void
  loading?: boolean
}

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Blue (Dark)', value: 'bg-blue-600' },
  { name: 'Gray', value: 'bg-gray-600' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Pink', value: 'bg-pink-500' }
]

const iconSuggestions = [
  '🏢', '💰', '👥', '📄', '🎧', '📅', '✉️', '📖', '📊', '🔧',
  '⚙️', '📱', '💻', '🌐', '🔒', '📈', '📋', '🎯', '🚀', '⭐'
]

export function AppForm({ app, onSave, onCancel, loading = false }: AppFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏢',
    url: '',
    color: 'bg-blue-500',
    description: '',
    order: 0,
    isActive: true
  })

  useEffect(() => {
    if (app) {
      setFormData({
        name: app.name,
        icon: app.icon,
        url: app.url,
        color: app.color,
        description: app.description || '',
        order: app.order,
        isActive: app.isActive
      })
    }
  }, [app])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              App Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter app name"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="https://example.com"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter app description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Visual & Settings */}
        <div className="space-y-4">
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
              Icon (Emoji) *
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="icon"
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                required
                placeholder="🏢"
                className="w-20"
                maxLength={2}
              />
              <div className={`w-10 h-10 ${formData.color} rounded-full flex items-center justify-center text-white text-lg`}>
                {formData.icon}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-1">
                {iconSuggestions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center text-sm"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Background Color *
            </label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {colorOptions.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-6 h-6 ${color.value} rounded border-2 ${
                    formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                  }`}
                />
              ))}
            </div>
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
      </div>

      {/* Preview */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-fit">
          <div className={`w-12 h-12 ${formData.color} rounded-full flex items-center justify-center text-white text-xl`}>
            {formData.icon}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{formData.name || 'App Name'}</div>
            {formData.description && (
              <div className="text-xs text-gray-600">{formData.description}</div>
            )}
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
          {loading ? 'Saving...' : (app ? 'Update App' : 'Create App')}
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