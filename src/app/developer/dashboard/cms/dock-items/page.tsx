'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/developer/sidebar'
import { DockItemsTable } from '@/components/developer/dock-items-table'
import { DockItemForm } from '@/components/developer/dock-item-form'

interface DockItem {
  id: string
  title: string
  icon: string
  href: string
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

export default function DockItemsCMS() {
  const [dockItems, setDockItems] = useState<DockItem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDockItem, setEditingDockItem] = useState<DockItem | null>(null)
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
    fetchDockItems()
  }, [router])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchDockItems = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/developer/dock-items?page=${page}&limit=${pagination.limit}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          return
        }
        throw new Error('Failed to fetch dock items')
      }

      const data = await response.json()
      setDockItems(data.dockItems)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching dock items:', error)
      alert('Failed to fetch dock items')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/developer')
  }

  const handleAddDockItem = () => {
    setEditingDockItem(null)
    setShowForm(true)
  }

  const handleEditDockItem = (dockItem: DockItem) => {
    setEditingDockItem(dockItem)
    setShowForm(true)
  }

  const handleDeleteDockItem = async (dockItem: DockItem) => {
    if (!confirm(`Are you sure you want to delete "${dockItem.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/developer/dock-items/${dockItem.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to delete dock item')
      }

      alert('Dock item deleted successfully')
      fetchDockItems(pagination.page)
    } catch (error) {
      console.error('Error deleting dock item:', error)
      alert('Failed to delete dock item')
    }
  }

  const handleSaveDockItem = async (dockItemData: Omit<DockItem, 'id' | 'createdAt' | 'updatedAt' | 'createdByUser'>) => {
    try {
      const url = editingDockItem 
        ? `/api/developer/dock-items/${editingDockItem.id}`
        : '/api/developer/dock-items'
      
      const method = editingDockItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dockItemData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save dock item')
      }

      alert(editingDockItem ? 'Dock item updated successfully' : 'Dock item created successfully')
      setShowForm(false)
      setEditingDockItem(null)
      fetchDockItems(pagination.page)
    } catch (error: any) {
      console.error('Error saving dock item:', error)
      alert(error.message || 'Failed to save dock item')
    }
  }

  const handlePageChange = (page: number) => {
    fetchDockItems(page)
  }

  const handleRefresh = () => {
    fetchDockItems(pagination.page)
  }

  if (loading && dockItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dock items...</p>
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
                  Floating Dock Management
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
                {editingDockItem ? 'Edit Dock Item' : 'Add New Dock Item'}
              </h3>
              <DockItemForm
                dockItem={editingDockItem || undefined}
                onSave={handleSaveDockItem}
                onCancel={() => {
                  setShowForm(false)
                  setEditingDockItem(null)
                }}
                loading={loading}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <DockItemsTable
                dockItems={dockItems}
                pagination={pagination}
                onEdit={handleEditDockItem}
                onDelete={handleDeleteDockItem}
                onPageChange={handlePageChange}
                onRefresh={handleRefresh}
                onAdd={handleAddDockItem}
                loading={loading}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}