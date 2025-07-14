'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, ExternalLink, Plus, RefreshCw, Eye, EyeOff } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

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

interface DockItemsTableProps {
  dockItems: DockItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  onEdit: (dockItem: DockItem) => void
  onDelete: (dockItem: DockItem) => void
  onPageChange: (page: number) => void
  onRefresh: () => void
  onAdd: () => void
  loading?: boolean
}

export function DockItemsTable({
  dockItems,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  onRefresh,
  onAdd,
  loading = false
}: DockItemsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderIcon = (iconName: string) => {
    try {
      const IconComponent = (LucideIcons as any)[iconName]
      if (IconComponent) {
        return <IconComponent className="h-5 w-5" />
      }
      return <span className="text-sm font-mono">{iconName}</span>
    } catch {
      return <span className="text-sm font-mono">{iconName}</span>
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dock Items Management</h2>
        <div className="flex space-x-2">
          <Button onClick={onAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Dock Item
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Total: {pagination.total} dock items
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dockItems.map((dockItem) => (
              <tr key={dockItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      {renderIcon(dockItem.icon)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dockItem.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {dockItem.href.startsWith('http') ? (
                    <a
                      href={dockItem.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <span className="truncate max-w-xs">{dockItem.href}</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-gray-900 truncate max-w-xs">{dockItem.href}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dockItem.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {dockItem.isActive ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 flex items-center">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dockItem.createdByUser.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(dockItem.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onEdit(dockItem)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(dockItem)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {dockItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No dock items found</div>
          <p className="text-gray-400 mt-2">Add your first dock item to get started</p>
        </div>
      )}
    </div>
  )
}