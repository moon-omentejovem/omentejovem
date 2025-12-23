import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  UpdateArtifactInternalPageSchema
} from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { NextRequest, NextResponse } from 'next/server'

type ArtifactInternalPageUpdate =
  Database['public']['Tables']['artifact_internal_pages']['Update']

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('artifact_internal_pages')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Artifact internal page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching artifact internal page:', error)
    return NextResponse.json(
      { error: 'Artifact internal page not found' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const validated = UpdateArtifactInternalPageSchema.parse(body)

    const updatePayload: ArtifactInternalPageUpdate = {
      ...validated,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('artifact_internal_pages')
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
            'Supabase error while updating artifact internal page',
          code: anyError.code,
          details: anyError.details ?? anyError,
          hint: anyError.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating artifact internal page:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update artifact internal page' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const patchPayload: ArtifactInternalPageUpdate = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('artifact_internal_pages')
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
            'Supabase error while updating artifact internal page',
          code: anyError.code,
          details: anyError.details ?? anyError,
          hint: anyError.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating artifact internal page:', error)
    return NextResponse.json(
      { error: 'Failed to update artifact internal page' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('artifact_internal_pages')
      .delete()
      .eq('id', params.id)

    if (error) {
      const anyError = error as any
      return NextResponse.json(
        {
          error:
            anyError.message ||
            'Supabase error while deleting artifact internal page',
          code: anyError.code,
          details: anyError.details ?? anyError,
          hint: anyError.hint
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artifact internal page:', error)
    return NextResponse.json(
      { error: 'Failed to delete artifact internal page' },
      { status: 500 }
    )
  }
}

