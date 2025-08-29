import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateArtworkSchema } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/artworks - List all artworks
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('artworks')
      .select(
        `
        *,
        series_artworks(
          series(*)
        )
      `
      )
      .order('posted_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

// POST /api/admin/artworks - Create new artwork
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = CreateArtworkSchema.parse(body)

    // Insert artwork
    const { data: artwork, error } = await supabaseAdmin
      .from('artworks')
      .insert({
        ...validatedData,
        posted_at: validatedData.posted_at || new Date().toISOString()
      } as Database['public']['Tables']['artworks']['Insert'])
      .select()
      .single()

    if (error) throw error

    // Handle series relationships if provided
    if (body.series && body.series.length > 0) {
      const seriesRelations = body.series.map((seriesId: string) => ({
        series_id: seriesId,
        artwork_id: artwork.id
      }))

      const { error: relationError } = await supabaseAdmin
        .from('series_artworks')
        .insert(seriesRelations)

      if (relationError) throw relationError
    }

    // Revalidate cache
    revalidateTag('artworks')
    revalidateTag('featured-artworks')
    revalidateTag('portfolio')

    return NextResponse.json(artwork, { status: 201 })
  } catch (error) {
    console.error('Error creating artwork:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}
