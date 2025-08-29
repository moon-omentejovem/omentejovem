import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('src')

  if (!imageUrl) {
    return new NextResponse('Missing src parameter', { status: 400 })
  }

  try {
    // Validate URL to prevent SSRF attacks
    const url = new URL(imageUrl)
    if (!url.protocol.startsWith('http')) {
      return new NextResponse('Invalid URL protocol', { status: 400 })
    }

    // Fetch the image from the external URL
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'omentejovem-image-proxy/1.0'
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

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
