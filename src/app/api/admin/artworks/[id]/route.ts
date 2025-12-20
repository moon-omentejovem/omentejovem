import { handleApiError } from '@/lib/api-utils'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { UpdateArtworkSchema } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Process artwork images to ensure URLs are valid
 */

// GET /api/admin/artworks/[id] - Get single artwork
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = UpdateArtworkSchema.parse(body)
    const imageoptimizedurl = body.imageoptimizedurl || null

    const updatePayload: Database['public']['Tables']['artworks']['Update'] = {
      ...validatedData,
      imageoptimizedurl,
      updated_at: new Date().toISOString()
    }

    const { data: artwork, error } = await supabaseAdmin
      .from('artworks')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      const anyError = error as any
      return NextResponse.json(
        {
          error:
            anyError.message ||
            'Supabase error while updating artwork (PUT /api/admin/artworks/[id])',
          code: anyError.code,
          details: anyError.details ?? anyError,
          hint: anyError.hint
        },
        { status: 500 }
      )
    }

    // Handle series relationships if provided
    if (body.series !== undefined) {
      // Remove existing relationships
      await supabaseAdmin
        .from('series_artworks')
        .delete()
        .eq('artwork_id', params.id)

      // Add new relationships
      if (body.series.length > 0) {
        const seriesRelations = body.series.map((seriesId: string) => ({
          series_id: seriesId,
          artwork_id: params.id
        }))

        const { error: relationError } = await supabaseAdmin
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
    return handleApiError(error)
  }
}

// PATCH /api/admin/artworks/[id] - Partial update artwork
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const imageoptimizedurl = body.imageoptimizedurl || null
    const patchPayload: Database['public']['Tables']['artworks']['Update'] = {
      ...body,
      imageoptimizedurl,
      updated_at: new Date().toISOString()
    }

    const { data: artwork, error } = await supabaseAdmin
      .from('artworks')
      .update(patchPayload)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      const anyError = error as any
      return NextResponse.json(
        {
          error:
            anyError.message ||
            'Supabase error while updating artwork (PATCH /api/admin/artworks/[id])',
          code: anyError.code,
          details: anyError.details ?? anyError,
          hint: anyError.hint
        },
        { status: 500 }
      )
    }

    // Revalidate cache
    revalidateTag('artworks')
    revalidateTag('featured-artworks')
    revalidateTag('portfolio')

    return NextResponse.json(artwork)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/artworks/[id] - Delete artwork
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
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
