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

    let query = supabaseAdmin
      .from('artifacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query.range(from, to)

    if (error) throw error

    return NextResponse.json({ data, total: count })
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
    const body = await request.json()

    // Validate input
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

    return NextResponse.json(artifact, { status: 201 })
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
