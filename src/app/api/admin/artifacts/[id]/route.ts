import { supabaseAdmin } from '@/lib/supabase-admin'
import { UpdateArtifactSchema } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/artifacts/[id] - Get single artifact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('artifacts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching artifact:', error)
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
  }
}

// PUT /api/admin/artifacts/[id] - Update artifact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = await request.json()

    const body = {
      ...raw,
      page_link_url:
        typeof raw.page_link_url === 'string' &&
        raw.page_link_url.trim() === ''
          ? null
          : raw.page_link_url,
      link_url:
        typeof raw.link_url === 'string' && raw.link_url.trim() === ''
          ? null
          : raw.link_url,
      highlight_video_url:
        typeof raw.highlight_video_url === 'string' &&
        raw.highlight_video_url.trim() === ''
          ? null
          : raw.highlight_video_url,
      imageurl:
        typeof raw.imageurl === 'string' && raw.imageurl.trim() === ''
          ? null
          : raw.imageurl,
      description:
        typeof raw.description === 'string' && raw.description.trim() === ''
          ? null
          : raw.description,
      collection_label:
        typeof raw.collection_label === 'string' &&
        raw.collection_label.trim() === ''
          ? null
          : raw.collection_label
    }

    const validatedData = UpdateArtifactSchema.parse(body)

    // Update artifact
    const { data: artifact, error } = await supabaseAdmin
      .from('artifacts')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      } as Database['public']['Tables']['artifacts']['Update'])
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Revalidate cache
    revalidateTag('artifacts')

    return NextResponse.json(artifact)
  } catch (error) {
    console.error('Error updating artifact:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update artifact' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/artifacts/[id] - Partial update artifact
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // For partial updates, we don't validate the entire schema
    // Just update the provided fields
    const { data: artifact, error } = await supabaseAdmin
      .from('artifacts')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      } as Database['public']['Tables']['artifacts']['Update'])
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Revalidate cache
    revalidateTag('artifacts')

    return NextResponse.json(artifact)
  } catch (error) {
    console.error('Error updating artifact:', error)
    return NextResponse.json(
      { error: 'Failed to update artifact' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/artifacts/[id] - Delete artifact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('artifacts')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    // Revalidate cache
    revalidateTag('artifacts')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artifact:', error)
    return NextResponse.json(
      { error: 'Failed to delete artifact' },
      { status: 500 }
    )
  }
}
