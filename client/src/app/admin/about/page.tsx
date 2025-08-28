'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import TiptapEditor from '@/components/admin/TiptapEditor'
import type { Database } from '@/types/supabase'
import { SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

type AboutPageRow = Database['public']['Tables']['about_page']['Row']

export default function AboutPage() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    fetchAboutPage()
  }, [])

  const fetchAboutPage = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch('/api/admin/about')
      if (response.ok) {
        const data = await response.json()
        setContent(
          data.content || {
            type: 'doc',
            content: []
          }
        )
        setLastSaved(data.updated_at)
      }
    } catch (error) {
      console.error('Error fetching about page:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        const data = await response.json()
        setLastSaved(data.updated_at)
        alert('About page saved successfully!')
      } else {
        const error = await response.json()
        console.error('Error saving about page:', error)
        alert('Failed to save about page: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving about page:', error)
      alert('Failed to save about page')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-400">Loading about page...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">About Page</h1>
            {lastSaved && (
              <p className="text-sm text-neutral-400 mt-1">
                Last saved: {new Date(lastSaved).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg overflow-hidden">
          <div className="p-6">
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write about the project, artist, or collection..."
              className="min-h-[500px]"
            />
          </div>

          <div className="flex justify-end p-6 border-t border-neutral-700">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <SaveIcon className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
