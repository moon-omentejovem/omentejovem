import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route para proxy de imagens
 * Garante que imagens externas sejam servidas via SSR para otimização
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return new NextResponse('URL da imagem é obrigatória', { status: 400 })
    }

    // Validar se é uma URL válida
    let url: URL
    try {
      url = new URL(imageUrl)
    } catch {
      return new NextResponse('URL inválida', { status: 400 })
    }

    // Permitir apenas URLs do Supabase por segurança
    const allowedHosts = ['supabase.co', 'supabase.com']

    const isAllowed = allowedHosts.some((host) => url.hostname.includes(host))

    if (!isAllowed) {
      return new NextResponse('Host não permitido', { status: 403 })
    }

    // Buscar a imagem
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Omentejovem-ImageProxy/1.0'
      }
    })

    if (!response.ok) {
      return new NextResponse('Erro ao carregar imagem', {
        status: response.status
      })
    }

    // Obter o tipo de conteúdo
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Retornar a imagem com cache headers apropriados
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 ano
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Erro no proxy de imagens:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
}
