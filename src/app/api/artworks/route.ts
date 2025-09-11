import { getArtworksServer } from '@/lib/server-queries'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const artworks = await getArtworksServer({ limit })

    return NextResponse.json(artworks, {
      headers: {
        'Cache-Control': 'public, max-age=300' // 5 minutos
      }
    })
  } catch (error) {
    console.error('Erro na API de artworks:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar artworks' },
      { status: 500 }
    )
  }
}
