import { supabase } from '@/lib/supabase'
import { UpdateAboutPageSchema } from '@/types/schemas'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/about - Get about page content
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('about_page')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // If no record exists, return empty content
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({
        id: null,
        content: null,
        updated_at: null
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching about page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about page' },
      { status: 500 }
    )
  }
}

// POST /api/admin/about - Create or update about page content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = UpdateAboutPageSchema.parse(body)

    // Check if about page exists
    const { data: existing } = await supabase
      .from('about_page')
      .select('id')
      .limit(1)
      .single()

    let result

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('about_page')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('about_page')
        .insert(validatedData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // Revalidate cache
    revalidateTag('about')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving about page:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save about page' },
      { status: 500 }
    )
  }
}
