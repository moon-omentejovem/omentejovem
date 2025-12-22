import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_TTL_DAYS = 10
const DEFAULT_TTL_SECONDS = DEFAULT_TTL_DAYS * 24 * 60 * 60
const SETTINGS_KEY = 'images_proxy'
const CONFIG_CACHE_MS = 5 * 60 * 1000

let cachedTtlSeconds = DEFAULT_TTL_SECONDS
let cachedLoadedAt = 0

async function getCacheTtlSeconds() {
  const now = Date.now()
  if (now - cachedLoadedAt < CONFIG_CACHE_MS && cachedLoadedAt !== 0) {
    return cachedTtlSeconds
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('cache_settings' as any)
      .select('*')
      .eq('key', SETTINGS_KEY)
      .limit(1)
      .single()

    if (error && (error as any).code !== 'PGRST116') {
      throw error
    }

    if (error && (error as any).code === 'PGRST116') {
      cachedTtlSeconds = DEFAULT_TTL_SECONDS
      cachedLoadedAt = now
      return cachedTtlSeconds
    }

    const ttlSeconds =
      typeof (data as any).cache_ttl_seconds === 'number' &&
      (data as any).cache_ttl_seconds >= 0
        ? (data as any).cache_ttl_seconds
        : DEFAULT_TTL_SECONDS

    cachedTtlSeconds = ttlSeconds
    cachedLoadedAt = now
    return cachedTtlSeconds
  } catch {
    cachedTtlSeconds = DEFAULT_TTL_SECONDS
    cachedLoadedAt = now
    return cachedTtlSeconds
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  const width = searchParams.get('width')
  const height = searchParams.get('height')
  const quality = searchParams.get('quality')
  const format = searchParams.get('format')

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    // Validate URL to prevent SSRF attacks
    const url = new URL(imageUrl)
    if (!url.protocol.startsWith('http')) {
      return new NextResponse('Invalid URL protocol', { status: 400 })
    }

    // Build the fetch URL with potential transformations
    let fetchUrl = imageUrl

    // For external images that need transformations, we can use a service or apply them locally
    const imageResponse = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'omentejovem-image-proxy/1.0',
        Accept: 'image/*'
      }
    })

    if (!imageResponse.ok) {
      return new NextResponse('Failed to fetch image', {
        status: imageResponse.status
      })
    }

    const contentType = imageResponse.headers.get('content-type')

    // Validate content type
    if (!contentType?.startsWith('image/')) {
      return new NextResponse('Invalid content type', { status: 400 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const ttlSeconds = await getCacheTtlSeconds()
    const cacheHeader =
      ttlSeconds > 0
        ? `public, max-age=${ttlSeconds}, immutable`
        : 'public, max-age=0, must-revalidate'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheHeader,
        'Access-Control-Allow-Origin': '*',
        Vary: 'Accept'
      }
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
