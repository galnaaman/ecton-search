'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Site {
  id: string
  name: string
  url: string
  description: string | null
  type: string
  createdAt: string
  updatedAt: string
  createdByUser: {
    username: string
  }
}

interface SiteFormProps {
  site?: Site
  onSave: (site: Omit<Site, 'id' | 'createdAt' | 'updatedAt' | 'createdByUser'>) => void
  onCancel: () => void
  loading?: boolean
}

export function SiteForm({ site, onSave, onCancel, loading = false }: SiteFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    type: 'website'
  })

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        url: site.url,
        description: site.description || '',
        type: site.type
      })
    }
  }, [site])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter site name"
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
          placeholder="Enter site description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="website">Website</option>
          <option value="document">Document</option>
          <option value="system">System</option>
          <option value="database">Database</option>
        </select>
      </div>

      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : (site ? 'Update Site' : 'Create Site')}
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