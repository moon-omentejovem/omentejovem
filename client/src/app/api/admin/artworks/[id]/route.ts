import { supabase } from '@/lib/supabase'
import { UpdateArtworkSchema } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/artworks/[id] - Get single artwork
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select(
        `
        *,
        series_artworks(
          series(*)
        )
      `
      )
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
  }
}

// PUT /api/admin/artworks/[id] - Update artwork
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = UpdateArtworkSchema.parse(body)

    // Update artwork
    const { data: artwork, error } = await supabase
      .from('artworks')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      } as Database['public']['Tables']['artworks']['Update'])
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Handle series relationships if provided
    if (body.series !== undefined) {
      // Remove existing relationships
      await supabase
        .from('series_artworks')
        .delete()
        .eq('artwork_id', params.id)

      // Add new relationships
      if (body.series.length > 0) {
        const seriesRelations = body.series.map((seriesId: string) => ({
          series_id: seriesId,
          artwork_id: params.id
        }))

        const { error: relationError } = await supabase
          .from('series_artworks')
          .insert(seriesRelations)

        if (relationError) throw relationError
      }
    }

    // Revalidate cache
    revalidateTag('artworks')
    revalidateTag('featured-artworks')
    revalidateTag('portfolio')

    return NextResponse.json(artwork)
  } catch (error) {
    console.error('Error updating artwork:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/artworks/[id] - Delete artwork
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    // Revalidate cache
    revalidateTag('artworks')
    revalidateTag('featured-artworks')
    revalidateTag('portfolio')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}
