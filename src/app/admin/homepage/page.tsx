'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import { SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface HomepageSettings {
  title: string
  subtitle: string
  show_title: boolean
  show_subtitle: boolean
  featured_label: string
  featured_artifact_slug: string | null
  featured_artwork_slug: string | null
  background_color: string
  header_logo_color: string
  updated_at?: string | null
}

export default function HomepageAdminPage() {
  const [data, setData] = useState<HomepageSettings>({
    title: 'Thales Machado',
    subtitle: 'omentejovem',
    show_title: false,
    show_subtitle: true,
    featured_label: 'Featured collection',
    featured_artifact_slug: null,
    featured_artwork_slug: null,
    background_color: '#000000',
    header_logo_color: '#f7ea4d'
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [artifactOptions, setArtifactOptions] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([])
  const [artifactsLoading, setArtifactsLoading] = useState(false)
  const [artworkOptions, setArtworkOptions] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([])
  const [artworksLoading, setArtworksLoading] = useState(false)

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        setFetchLoading(true)
        const response = await fetch('/api/admin/homepage')
        if (response.ok) {
          const result = await response.json()
          setData({
            title: result.title || 'Thales Machado',
            subtitle: result.subtitle || 'omentejovem',
            show_title:
              typeof result.show_title === 'boolean'
                ? result.show_title
                : false,
            show_subtitle:
              typeof result.show_subtitle === 'boolean'
                ? result.show_subtitle
                : true,
            featured_label:
              typeof result.featured_label === 'string' &&
              result.featured_label.trim() !== ''
                ? result.featured_label
                : 'Featured collection',
            featured_artifact_slug:
              typeof result.featured_artifact_slug === 'string' &&
              result.featured_artifact_slug.trim() !== ''
                ? result.featured_artifact_slug.trim()
                : null,
            featured_artwork_slug:
              typeof result.featured_artwork_slug === 'string' &&
              result.featured_artwork_slug.trim() !== ''
                ? result.featured_artwork_slug.trim()
                : null,
            background_color:
              typeof result.background_color === 'string' &&
              result.background_color.trim() !== ''
                ? result.background_color.trim()
                : '#000000',
            header_logo_color:
              typeof result.header_logo_color === 'string' &&
              result.header_logo_color.trim() !== ''
                ? result.header_logo_color.trim()
                : '#f7ea4d',
            updated_at: result.updated_at
          })
          setLastSaved(result.updated_at ?? null)
        } else {
          toast.error('Failed to load homepage settings')
        }
      } catch (error) {
          console.error('Error fetching homepage settings:', error)
          toast.error('Failed to load homepage settings')
        } finally {
          setFetchLoading(false)
        }
      }

    const fetchArtifacts = async () => {
      try {
        setArtifactsLoading(true)
        const response = await fetch(
          '/api/admin/artifact-internal-pages?status=published&page=1&limit=100'
        )
        if (response.ok) {
          const result = await response.json()
          const items = Array.isArray(result.data) ? result.data : []
          setArtifactOptions(
            items
              .filter(
                (item: any) =>
                  typeof item.slug === 'string' &&
                  item.slug.trim() !== '' &&
                  typeof item.title === 'string'
              )
              .map((item: any) => ({
                id: String(item.id),
                title: item.title as string,
                slug: item.slug as string
              }))
          )
        }
      } catch (error) {
        console.error('Error fetching artifact internal pages:', error)
      } finally {
        setArtifactsLoading(false)
      }
    }

    const fetchArtworks = async () => {
      try {
        setArtworksLoading(true)
        const response = await fetch(
          '/api/admin/artworks?status=published&page=1&limit=100'
        )
        if (response.ok) {
          const result = await response.json()
          const items = Array.isArray(result.data) ? result.data : []
          setArtworkOptions(
            items
              .filter(
                (item: any) =>
                  typeof item.slug === 'string' &&
                  item.slug.trim() !== '' &&
                  typeof item.title === 'string'
              )
              .map((item: any) => ({
                id: String(item.id),
                title: item.title as string,
                slug: item.slug as string
              }))
          )
        }
      } catch (error) {
        console.error('Error fetching artworks:', error)
      } finally {
        setArtworksLoading(false)
      }
    }

    fetchHomepage()
    fetchArtifacts()
    fetchArtworks()
  }, [])

  const handleSave = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title,
          subtitle: data.subtitle,
          show_title: data.show_title,
          show_subtitle: data.show_subtitle,
          featured_label: data.featured_label,
          featured_artifact_slug: data.featured_artifact_slug,
          featured_artwork_slug: data.featured_artwork_slug,
          background_color: data.background_color,
          header_logo_color: data.header_logo_color
        })
      })

      if (response.ok) {
        const result = await response.json()
        setLastSaved(result.updated_at ?? null)
        toast.success('Homepage settings saved successfully!')
      } else {
        const error = await response.json()
        console.error('Error saving homepage settings:', error)
        toast.error(
          'Failed to save homepage settings: ' +
            (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      console.error('Error saving homepage settings:', error)
      toast.error('Failed to save homepage settings')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  const hasSelectedArtifactOption =
    !!data.featured_artifact_slug &&
    artifactOptions.some(
      (item) => item.slug === data.featured_artifact_slug
    )

  const hasSelectedArtworkOption =
    !!data.featured_artwork_slug &&
    artworkOptions.some(
      (item) => item.slug === data.featured_artwork_slug
    )

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Homepage Settings
            </h1>
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

        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="homepage-title" className="block text-sm font-medium text-gray-700">
              Homepage Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(event) =>
                setData((previous) => ({
                  ...previous,
                  title: event.target.value
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Homepage title"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="homepage-subtitle" className="block text-sm font-medium text-gray-700">
              Homepage Subtitle
            </label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(event) =>
                setData((previous) => ({
                  ...previous,
                  subtitle: event.target.value
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Homepage subtitle"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="homepage-background-color"
              className="block text-sm font-medium text-gray-700"
            >
              Homepage Background Color
            </label>
            <input
              id="homepage-background-color"
              type="text"
              value={data.background_color}
              onChange={(event) =>
                setData((previous) => ({
                  ...previous,
                  background_color: event.target.value
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
              placeholder="#000000"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="homepage-logo-color"
              className="block text-sm font-medium text-gray-700"
            >
              Header Logo Color (Homepage only)
            </label>
            <input
              id="homepage-logo-color"
              type="text"
              value={data.header_logo_color}
              onChange={(event) =>
                setData((previous) => ({
                  ...previous,
                  header_logo_color: event.target.value
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
              placeholder="#f7ea4d"
            />
            <p className="text-xs text-gray-500">
              Hex color applied to the header logo only on the homepage.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <input
                id="show-title"
                type="checkbox"
                checked={data.show_title}
                onChange={(event) =>
                  setData((previous) => ({
                    ...previous,
                    show_title: event.target.checked
                  }))
                }
                className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label
                htmlFor="show-title"
                className="text-sm font-medium text-gray-700"
              >
                Show homepage title on hero
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="show-subtitle"
                type="checkbox"
                checked={data.show_subtitle}
                onChange={(event) =>
                  setData((previous) => ({
                    ...previous,
                    show_subtitle: event.target.checked
                  }))
                }
                className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label
                htmlFor="show-subtitle"
                className="text-sm font-medium text-gray-700"
              >
                Show subtitle (&quot;omentejovem&quot;) on homepage
              </label>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="space-y-2">
            <label htmlFor="featured-label" className="block text-sm font-medium text-gray-700">
              Featured label text
            </label>
            <input
              type="text"
              value={data.featured_label}
              onChange={(event) =>
                setData((previous) => ({
                  ...previous,
                  featured_label: event.target.value
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Featured collection label"
            />
            <p className="text-xs text-gray-500">
              Default: &quot;Featured collection&quot;. This text appears above
              the highlighted title on the homepage.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="featured-artifact-slug"
              className="block text-sm font-medium text-gray-700"
            >
              Featured artifact page
            </label>
            <select
              id="featured-artifact-slug"
              value={data.featured_artifact_slug || ''}
              onChange={(event) =>
                setData((previous) => ({
                  ...previous,
                  featured_artifact_slug:
                    event.target.value === '' ? null : event.target.value,
                  featured_artwork_slug:
                    event.target.value === '' ? previous.featured_artwork_slug : null
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
              disabled={artifactsLoading || !!data.featured_artwork_slug}
              >
              <option value="">
                {artifactsLoading
                  ? 'Loading artifact pages...'
                  : 'None (no featured link)'}
              </option>
              {!hasSelectedArtifactOption && data.featured_artifact_slug && (
                <option value={data.featured_artifact_slug}>
                  {data.featured_artifact_slug} (currently saved)
                </option>
              )}
              {artifactOptions.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.title} ({item.slug})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Choose which artifact internal page will be highlighted. The
              title becomes clickable on the homepage and links to
              <span className="font-mono">
                {' '}
                /artifacts/
                {'{slug}'}
              </span>
              .
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="featured-artwork-slug"
              className="block text-sm font-medium text-gray-700"
            >
              Featured artwork page
            </label>
            <select
              id="featured-artwork-slug"
              value={data.featured_artwork_slug || ''}
              onChange={(event) =>
                setData((previous) => ({
                  ...previous,
                  featured_artwork_slug:
                    event.target.value === '' ? null : event.target.value,
                  featured_artifact_slug:
                    event.target.value === '' ? previous.featured_artifact_slug : null
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
              disabled={artworksLoading || !!data.featured_artifact_slug}
              >
              <option value="">
                {artworksLoading
                  ? 'Loading artworks...'
                  : 'None (no featured artwork link)'}
              </option>
              {!hasSelectedArtworkOption && data.featured_artwork_slug && (
                <option value={data.featured_artwork_slug}>
                  {data.featured_artwork_slug} (currently saved)
                </option>
              )}
              {artworkOptions.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.title} ({item.slug})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Choose which artwork page will be highlighted. The title becomes
              clickable on the homepage and links to
              <span className="font-mono">
                {' '}
                /portfolio/
                {'{slug}'}
              </span>
              .
            </p>
          </div>

          <p className="text-xs text-gray-500 pt-2">
            These values control the main title, subtitle visibility and the
            featured artifact or artwork highlight displayed on the public
            homepage.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
