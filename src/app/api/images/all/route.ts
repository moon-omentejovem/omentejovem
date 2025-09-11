import { getArtworksServer } from '@/lib/server-queries'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API route para obter todas as imagens do site para pre-cache
 * GET /api/images/all
 */
export async function GET(request: NextRequest) {
  try {
    // Buscar todas as imagens do site
    const artworks = await getArtworksServer({ limit: 50 }) // Aumentar limite
    const images = artworks.map((artwork) => artwork.image_url).filter(Boolean)

    // Adicionar imagens estáticas críticas
    const staticImages = [
      '/S&C Cover.jpg',
      '/Stories on Circles Cover.jpg',
      '/TheCycleCover.jpg'
    ]

    const allImages = [...images, ...staticImages]

    return NextResponse.json(
      {
        images: allImages,
        count: allImages.length,
        timestamp: Date.now()
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300' // Cache por 5 minutos
        }
      }
    )
  } catch (error) {
    console.error('Erro ao buscar imagens:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar imagens' },
      { status: 500 }
    )
  }
}
