import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateArtifactSchema } from '@/types/schemas'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/artifacts - List all artifacts
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('artifacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
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
