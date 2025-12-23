import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateArtifactSchema } from '@/types/schemas'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/artifacts - List artifacts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.trim()

    let query = supabaseAdmin
      .from('artifacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      const pattern = `%${search}%`
      query = query.ilike('title', pattern)
    }

    const { data, count, error } = await query.range(from, to)

    if (error) throw error

    const artifactsWithImage = (data || []).map((artifact) => ({
      ...artifact,
      imageurl: artifact.imageurl || null
    }))
    return NextResponse.json({ data: artifactsWithImage, total: count })
  } catch (error) {
    console.error('Error fetching artifacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artifacts' },
      { status: 500 }
    )
  }
}

// POST /api/admin/artifacts - Create new artifact
export async function POST(request: NextRequest) {
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

    const validatedData = CreateArtifactSchema.parse(body)

    // Insert artifact
    const { data: artifact, error } = await supabaseAdmin
      .from('artifacts')
      .insert(validatedData)
      .select()
      .single()

    if (error) throw error

    // Revalidate cache
    revalidateTag('artifacts')

    const artifactWithImage = {
      ...artifact,
      imageurl: artifact.imageurl || null
    }
    return NextResponse.json(artifactWithImage, { status: 201 })
  } catch (error) {
    console.error('Error creating artifact:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create artifact' },
      { status: 500 }
    )
  }
}
