'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SitesTable } from '@/components/developer/sites-table'
import { SiteForm } from '@/components/developer/site-form'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

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

interface User {
  id: string
  username: string
  role: string
}

export default function DeveloperDashboard() {
  const [sites, setSites] = useState<Site[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/developer')
      return
    }

    setUser(JSON.parse(userData))
    fetchSites()
  }, [router])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchSites = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/developer/sites?page=${page}&limit=${pagination.limit}&search=${search}`,
        {
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          return
        }
        throw new Error('Failed to fetch sites')
      }

      const data = await response.json()
      setSites(data.sites)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching sites:', error)
      alert('Failed to fetch sites')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/developer')
  }

  const handleAddSite = () => {
    setEditingSite(null)
    setShowForm(true)
  }

  const handleEditSite = (site: Site) => {
    setEditingSite(site)
    setShowForm(true)
  }

  const handleDeleteSite = async (site: Site) => {
    if (!confirm(`Are you sure you want to delete "${site.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/developer/sites/${site.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to delete site')
      }

      alert('Site deleted successfully')
      fetchSites(pagination.page, searchQuery)
      handleSync()
    } catch (error) {
      console.error('Error deleting site:', error)
      alert('Failed to delete site')
    }
  }

  const handleSaveSite = async (siteData: Omit<Site, 'id'>) => {
    try {
      const url = editingSite 
        ? `/api/developer/sites/${editingSite.id}`
        : '/api/developer/sites'
      
      const method = editingSite ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(siteData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save site')
      }

      alert(editingSite ? 'Site updated successfully' : 'Site created successfully')
      setShowForm(false)
      setEditingSite(null)
      fetchSites(pagination.page, searchQuery)
      handleSync()
    } catch (error: any) {
      console.error('Error saving site:', error)
      alert(error.message || 'Failed to save site')
    }
  }

  const handleSync = async () => {
    try {
      const response = await fetch('/api/developer/sync', {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to sync')
      }

      alert('Meilisearch synchronized successfully')
    } catch (error) {
      console.error('Error syncing:', error)
      alert('Failed to sync to Meilisearch')
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchSites(1, query)
  }

  const handlePageChange = (page: number) => {
    fetchSites(page, searchQuery)
  }

  const handleRefresh = () => {
    fetchSites(pagination.page, searchQuery)
  }

  if (loading && sites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Developer Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
                <span className="text-gray-500">({user?.role})</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSite ? 'Edit Site' : 'Add New Site'}
            </h3>
            <SiteForm
              site={editingSite}
              onSave={handleSaveSite}
              onCancel={() => {
                setShowForm(false)
                setEditingSite(null)
              }}
              loading={loading}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <SitesTable
              sites={sites}
              pagination={pagination}
              onEdit={handleEditSite}
              onDelete={handleDeleteSite}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              onRefresh={handleRefresh}
              onSync={handleSync}
              onAdd={handleAddSite}
              loading={loading}
            />
          </div>
        )}
      </main>
    </div>
  )
}