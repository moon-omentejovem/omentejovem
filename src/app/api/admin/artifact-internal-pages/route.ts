import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateArtifactInternalPageSchema } from '@/types/schemas'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/artifact-internal-pages - List internal pages with pagination
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
      .from('artifact_internal_pages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      const pattern = `%${search}%`
      query = query.or(
        `title.ilike.${pattern},slug.ilike.${pattern}`
      )
    }

    const { data, count, error } = await query.range(from, to)

    if (error) throw error

    return NextResponse.json({ data: data || [], total: count || 0 })
  } catch (error) {
    console.error('Error fetching artifact internal pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artifact internal pages' },
      { status: 500 }
    )
  }
}

// POST /api/admin/artifact-internal-pages - Create new internal page
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()

    const body = {
      slug: raw.slug,
      title: raw.title,
      artifact_id:
        typeof raw.artifact_id === 'string' &&
        raw.artifact_id.trim() === ''
          ? null
          : raw.artifact_id,
      description:
        typeof raw.description === 'string' &&
        raw.description.trim() === ''
          ? null
          : raw.description,
      image1_url:
        typeof raw.image1_url === 'string' &&
        raw.image1_url.trim() === ''
          ? null
          : raw.image1_url,
      image2_url:
        typeof raw.image2_url === 'string' &&
        raw.image2_url.trim() === ''
          ? null
          : raw.image2_url,
      image3_url:
        typeof raw.image3_url === 'string' &&
        raw.image3_url.trim() === ''
          ? null
          : raw.image3_url,
      image4_url:
        typeof raw.image4_url === 'string' &&
        raw.image4_url.trim() === ''
          ? null
          : raw.image4_url,
      status: raw.status || 'draft'
    }

    const validatedData = CreateArtifactInternalPageSchema.parse(body)

    const { data, error } = await supabaseAdmin
      .from('artifact_internal_pages')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      const anyError = error as any
      return NextResponse.json(
        {
          error:
            anyError.message ||
            'Supabase error while creating artifact internal page',
          code: anyError.code,
          details: anyError.details ?? anyError,
          hint: anyError.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating artifact internal page:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create artifact internal page' },
      { status: 500 }
    )
  }
}
