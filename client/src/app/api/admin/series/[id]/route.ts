import { supabase } from '@/lib/supabase'
import { UpdateSeriesSchema } from '@/types/schemas'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/series/[id] - Get single series
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('series')
      .select(
        `
        *,
        series_artworks(
          artworks(*)
        )
      `
      )
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json({ error: 'Series not found' }, { status: 404 })
  }
}

// PUT /api/admin/series/[id] - Update series
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = UpdateSeriesSchema.parse(body)

    // Update series
    const { data: series, error } = await supabase
      .from('series')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Handle artwork relationships if provided
    if (body.artworks !== undefined) {
      // Remove existing relationships
      await supabase.from('series_artworks').delete().eq('series_id', params.id)

      // Add new relationships
      if (body.artworks.length > 0) {
        const artworkRelations = body.artworks.map((artworkId: string) => ({
          series_id: params.id,
          artwork_id: artworkId
        }))

        const { error: relationError } = await supabase
          .from('series_artworks')
          .insert(artworkRelations)

        if (relationError) throw relationError
      }
    }

    // Revalidate cache
    revalidateTag('series')

    return NextResponse.json(series)
  } catch (error) {
    console.error('Error updating series:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update series' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/series/[id] - Delete series
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase.from('series').delete().eq('id', params.id)

    if (error) throw error

    // Revalidate cache
    revalidateTag('series')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting series:', error)
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 }
    )
  }
}
