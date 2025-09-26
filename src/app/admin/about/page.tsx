'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import TiptapEditor from '@/components/admin/TiptapEditor'
import type { Database } from '@/types/supabase'
import { PlusIcon, SaveIcon, TrashIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type AboutPageRow = Database['public']['Tables']['about_page']['Row']

interface Social {
  platform: string
  handle: string
  url: string
}

interface Exhibition {
  title: string
  venue: string
  location: string
  year: string
  type: 'solo' | 'group' | 'online'
  description?: string
}

interface Press {
  title: string
  publication: string
  date: string
  url?: string
  type: 'feature' | 'interview' | 'review' | 'news'
}

interface AboutPageData {
  content: any
  socials: Social[]
  exhibitions: Exhibition[]
  press: Press[]
}

export default function AboutPage() {
  const [data, setData] = useState<AboutPageData>({
    content: { type: 'doc', content: [] },
    socials: [],
    exhibitions: [],
    press: []
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    fetchAboutPage()
  }, [])

  const fetchAboutPage = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch('/api/admin/about')
      if (response.ok) {
        const result = await response.json()
        setData({
          content: result.content || { type: 'doc', content: [] },
          socials: result.socials || [],
          exhibitions: result.exhibitions || [],
          press: result.press || []
        })
        setLastSaved(result.updated_at)
      } else {
        toast.error('Failed to load about page')
      }
    } catch (error) {
      console.error('Error fetching about page:', error)
      toast.error('Failed to load about page')
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
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        setLastSaved(result.updated_at)
        toast.success('About page saved successfully!')
      } else {
        const error = await response.json()
        console.error('Error saving about page:', error)
        toast.error(
          'Failed to save about page: ' + (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      console.error('Error saving about page:', error)
      toast.error('Failed to save about page')
    } finally {
      setLoading(false)
    }
  }

  const addSocial = () => {
    setData((prev) => ({
      ...prev,
      socials: [...prev.socials, { platform: '', handle: '', url: '' }]
    }))
  }

  const updateSocial = (index: number, field: keyof Social, value: string) => {
    setData((prev) => ({
      ...prev,
      socials: prev.socials.map((social, i) =>
        i === index ? { ...social, [field]: value } : social
      )
    }))
  }

  const removeSocial = (index: number) => {
    setData((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index)
    }))
  }

  const addExhibition = () => {
    setData((prev) => ({
      ...prev,
      exhibitions: [
        ...prev.exhibitions,
        {
          title: '',
          venue: '',
          location: '',
          year: '',
          type: 'group' as const,
          description: ''
        }
      ]
    }))
  }

  const updateExhibition = (
    index: number,
    field: keyof Exhibition,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      exhibitions: prev.exhibitions.map((exhibition, i) =>
        i === index ? { ...exhibition, [field]: value } : exhibition
      )
    }))
  }

  const removeExhibition = (index: number) => {
    setData((prev) => ({
      ...prev,
      exhibitions: prev.exhibitions.filter((_, i) => i !== index)
    }))
  }

  const addPress = () => {
    setData((prev) => ({
      ...prev,
      press: [
        ...prev.press,
        {
          title: '',
          publication: '',
          date: '',
          url: '',
          type: 'feature' as const
        }
      ]
    }))
  }

  const updatePress = (index: number, field: keyof Press, value: string) => {
    setData((prev) => ({
      ...prev,
      press: prev.press.map((press, i) =>
        i === index ? { ...press, [field]: value } : press
      )
    }))
  }

  const removePress = (index: number) => {
    setData((prev) => ({
      ...prev,
      press: prev.press.filter((_, i) => i !== index)
    }))
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading about page...</div>
        </div>
      </AdminLayout>
    )
  }

  const tabs = [
    { id: 'content', label: 'About Content' },
    { id: 'socials', label: 'Social Media' },
    { id: 'exhibitions', label: 'Exhibitions' },
    { id: 'press', label: 'Press & Media' }
  ]

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">About Page</h1>
            {lastSaved && (
              <p className="text-sm text-gray-500 mt-1">
                Last saved: {new Date(lastSaved).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <SaveIcon className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="p-6">
              <TiptapEditor
                content={data.content}
                onChange={(content) =>
                  setData((prev) => ({ ...prev, content }))
                }
                placeholder="Write about the artist, their background, artistic vision..."
                className="min-h-[500px]"
                editorSlug="about-page"
              />
            </div>
          )}

          {/* Socials Tab */}
          {activeTab === 'socials' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Social Media Profiles</h3>
                <button
                  onClick={addSocial}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Social</span>
                </button>
              </div>

              <div className="space-y-4">
                {data.socials.map((social, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <label
                        htmlFor={`social-platform-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Platform
                      </label>
                      <input
                        id={`social-platform-${index}`}
                        type="text"
                        value={social.platform}
                        onChange={(e) =>
                          updateSocial(index, 'platform', e.target.value)
                        }
                        placeholder="Twitter/X, Instagram, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`social-handle-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Handle
                      </label>
                      <input
                        id={`social-handle-${index}`}
                        type="text"
                        value={social.handle}
                        onChange={(e) =>
                          updateSocial(index, 'handle', e.target.value)
                        }
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`social-url-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        URL
                      </label>
                      <input
                        id={`social-url-${index}`}
                        type="url"
                        value={social.url}
                        onChange={(e) =>
                          updateSocial(index, 'url', e.target.value)
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeSocial(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {data.socials.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No social media profiles added yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exhibitions Tab */}
          {activeTab === 'exhibitions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Exhibition History</h3>
                <button
                  onClick={addExhibition}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Exhibition</span>
                </button>
              </div>

              <div className="space-y-6">
                {data.exhibitions.map((exhibition, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor={`exhibition-title-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Exhibition Title
                        </label>
                        <input
                          id={`exhibition-title-${index}`}
                          type="text"
                          value={exhibition.title}
                          onChange={(e) =>
                            updateExhibition(index, 'title', e.target.value)
                          }
                          placeholder="Exhibition name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`exhibition-venue-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Venue
                        </label>
                        <input
                          id={`exhibition-venue-${index}`}
                          type="text"
                          value={exhibition.venue}
                          onChange={(e) =>
                            updateExhibition(index, 'venue', e.target.value)
                          }
                          placeholder="Gallery or venue name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`exhibition-location-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Location
                        </label>
                        <input
                          id={`exhibition-location-${index}`}
                          type="text"
                          value={exhibition.location}
                          onChange={(e) =>
                            updateExhibition(index, 'location', e.target.value)
                          }
                          placeholder="City, Country"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`exhibition-year-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Year
                        </label>
                        <input
                          id={`exhibition-year-${index}`}
                          type="text"
                          value={exhibition.year}
                          onChange={(e) =>
                            updateExhibition(index, 'year', e.target.value)
                          }
                          placeholder="2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`exhibition-type-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Type
                        </label>
                        <select
                          id={`exhibition-type-${index}`}
                          value={exhibition.type}
                          onChange={(e) =>
                            updateExhibition(index, 'type', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="solo">Solo Exhibition</option>
                          <option value="group">Group Exhibition</option>
                          <option value="online">Online Exhibition</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeExhibition(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor={`exhibition-description-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id={`exhibition-description-${index}`}
                        value={exhibition.description || ''}
                        onChange={(e) =>
                          updateExhibition(index, 'description', e.target.value)
                        }
                        placeholder="Brief description of the exhibition"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ))}

                {data.exhibitions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No exhibitions added yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Press Tab */}
          {activeTab === 'press' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Press & Media Coverage</h3>
                <button
                  onClick={addPress}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Press</span>
                </button>
              </div>

              <div className="space-y-4">
                {data.press.map((press, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <label
                        htmlFor={`press-title-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Title
                      </label>
                      <input
                        id={`press-title-${index}`}
                        type="text"
                        value={press.title}
                        onChange={(e) =>
                          updatePress(index, 'title', e.target.value)
                        }
                        placeholder="Article/interview title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`press-publication-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Publication
                      </label>
                      <input
                        id={`press-publication-${index}`}
                        type="text"
                        value={press.publication}
                        onChange={(e) =>
                          updatePress(index, 'publication', e.target.value)
                        }
                        placeholder="Magazine, blog, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`press-date-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date
                      </label>
                      <input
                        id={`press-date-${index}`}
                        type="date"
                        value={press.date}
                        onChange={(e) =>
                          updatePress(index, 'date', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`press-type-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Type
                      </label>
                      <select
                        id={`press-type-${index}`}
                        value={press.type}
                        onChange={(e) =>
                          updatePress(index, 'type', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="feature">Feature</option>
                        <option value="interview">Interview</option>
                        <option value="review">Review</option>
                        <option value="news">News</option>
                      </select>
                    </div>
                    <div className="flex items-end space-x-2">
                      <input
                        type="url"
                        value={press.url || ''}
                        onChange={(e) =>
                          updatePress(index, 'url', e.target.value)
                        }
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => removePress(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {data.press.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No press coverage added yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
