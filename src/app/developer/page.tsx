'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/developer/login-form'

export default function DeveloperPortal() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token')
    if (token) {
      router.push('/developer/dashboard')
      return
    }

    // Initialize database on first visit
    initializeDatabase()
  }, [router])

  const initializeDatabase = async () => {
    try {
      const response = await fetch('/api/auth/init', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        setInitError(data.error || 'Failed to initialize database')
        return
      }

      setIsInitialized(true)
    } catch (error) {
      setInitError('Network error. Please ensure the database is running.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {initError ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
              Initialization Error
            </h2>
            <p className="text-gray-700 mb-4">{initError}</p>
            <div className="text-sm text-gray-600">
              <p>Please ensure:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>PostgreSQL database is running</li>
                <li>Database connection string is correct</li>
                <li>Run: <code className="bg-gray-100 px-1 rounded">npx prisma migrate dev</code></li>
              </ul>
            </div>
            <button
              onClick={initializeDatabase}
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Retry Initialization
            </button>
          </div>
        ) : isInitialized ? (
          <LoginForm />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing database...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}