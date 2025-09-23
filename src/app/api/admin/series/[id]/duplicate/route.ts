import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('series')
      .select('*, series_artworks(artwork_id)')
      .eq('id', params.id)
      .single()

    if (fetchError || !original) throw fetchError

    const timestamp = Date.now()
    const newSeriesData: any = {
      ...original,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${timestamp}`
    }
    delete newSeriesData.series_artworks

    const { data: newSeries, error: insertError } = await supabaseAdmin
      .from('series')
      .insert(newSeriesData)
      .select()
      .single()

    if (insertError) throw insertError

    if (original.series_artworks && original.series_artworks.length > 0) {
      const relations = original.series_artworks.map((sa: any) => ({
        series_id: newSeries.id,
        artwork_id: sa.artwork_id
      }))
      const { error: relError } = await supabaseAdmin
        .from('series_artworks')
        .insert(relations)
      if (relError) throw relError
    }

    revalidateTag('series')

    return NextResponse.json(newSeries, { status: 201 })
  } catch (error) {
    console.error('Error duplicating series:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate series' },
      { status: 500 }
    )
  }
}
