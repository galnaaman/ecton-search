'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/developer/sidebar'
import { AppsTable } from '@/components/developer/apps-table'
import { AppForm } from '@/components/developer/app-form'

interface App {
  id: string
  name: string
  icon: string
  url: string
  color: string
  description: string | null
  order: number
  isActive: boolean
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

export default function AppsCMS() {
  const [apps, setApps] = useState<App[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/developer')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') {
      router.push('/developer/dashboard')
      return
    }

    setUser(parsedUser)
    fetchApps()
  }, [router])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchApps = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/developer/apps?page=${page}&limit=${pagination.limit}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          return
        }
        throw new Error('Failed to fetch apps')
      }

      const data = await response.json()
      setApps(data.apps)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching apps:', error)
      alert('Failed to fetch apps')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/developer')
  }

  const handleAddApp = () => {
    setEditingApp(null)
    setShowForm(true)
  }

  const handleEditApp = (app: App) => {
    setEditingApp(app)
    setShowForm(true)
  }

  const handleDeleteApp = async (app: App) => {
    if (!confirm(`Are you sure you want to delete "${app.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/developer/apps/${app.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to delete app')
      }

      alert('App deleted successfully')
      fetchApps(pagination.page)
    } catch (error) {
      console.error('Error deleting app:', error)
      alert('Failed to delete app')
    }
  }

  const handleSaveApp = async (appData: Omit<App, 'id' | 'createdAt' | 'updatedAt' | 'createdByUser'>) => {
    try {
      const url = editingApp 
        ? `/api/developer/apps/${editingApp.id}`
        : '/api/developer/apps'
      
      const method = editingApp ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(appData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save app')
      }

      alert(editingApp ? 'App updated successfully' : 'App created successfully')
      setShowForm(false)
      setEditingApp(null)
      fetchApps(pagination.page)
    } catch (error: any) {
      console.error('Error saving app:', error)
      alert(error.message || 'Failed to save app')
    }
  }

  const handlePageChange = (page: number) => {
    fetchApps(page)
  }

  const handleRefresh = () => {
    fetchApps(pagination.page)
  }

  if (loading && apps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading apps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {user && <Sidebar user={user} onLogout={handleLogout} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Apps Grid Management
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {showForm ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingApp ? 'Edit App' : 'Add New App'}
              </h3>
              <AppForm
                app={editingApp || undefined}
                onSave={handleSaveApp}
                onCancel={() => {
                  setShowForm(false)
                  setEditingApp(null)
                }}
                loading={loading}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <AppsTable
                apps={apps}
                pagination={pagination}
                onEdit={handleEditApp}
                onDelete={handleDeleteApp}
                onPageChange={handlePageChange}
                onRefresh={handleRefresh}
                onAdd={handleAddApp}
                loading={loading}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}