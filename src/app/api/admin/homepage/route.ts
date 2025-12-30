import { supabaseAdmin } from '@/lib/supabase-admin'
import { HomeService } from '@/services'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await HomeService.getHomepageSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching homepage settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const rawTitle = typeof body.title === 'string' ? body.title.trim() : ''
    const rawSubtitle =
      typeof body.subtitle === 'string' ? body.subtitle.trim() : ''
    const showTitle =
      typeof body.show_title === 'boolean' ? body.show_title : false
    const rawFeaturedLabel =
      typeof body.featured_label === 'string'
        ? body.featured_label.trim()
        : ''
    const showSubtitle =
      typeof body.show_subtitle === 'boolean' ? body.show_subtitle : true
    const rawFeaturedArtifactSlug =
      typeof body.featured_artifact_slug === 'string'
        ? body.featured_artifact_slug.trim()
        : ''
    const rawFeaturedArtworkSlug =
      typeof body.featured_artwork_slug === 'string'
        ? body.featured_artwork_slug.trim()
        : ''
    const rawBackgroundColor =
      typeof body.background_color === 'string'
        ? body.background_color.trim()
        : ''

    const rawHeaderLogoColor =
      typeof body.header_logo_color === 'string'
        ? body.header_logo_color.trim()
        : ''

    const rawBackgroundImageUrl =
      typeof body.background_image_url === 'string'
        ? body.background_image_url.trim()
        : ''

    const rawBackgroundVideoUrl =
      typeof body.background_video_url === 'string'
        ? body.background_video_url.trim()
        : ''

    let artifactSlugForSave: string | null = null
    let artworkSlugForSave: string | null = null

    if (rawFeaturedArtifactSlug !== '') {
      artifactSlugForSave = rawFeaturedArtifactSlug
      artworkSlugForSave = null
    } else if (rawFeaturedArtworkSlug !== '') {
      artifactSlugForSave = null
      artworkSlugForSave = rawFeaturedArtworkSlug
    } else {
      artifactSlugForSave = null
      artworkSlugForSave = null
    }

    if (!rawTitle || !rawSubtitle) {
      return NextResponse.json(
        { error: 'Both title and subtitle are required' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    let backgroundImageUrlForSave: string | null = null
    let backgroundVideoUrlForSave: string | null = null

    if (rawBackgroundVideoUrl !== '') {
      backgroundVideoUrlForSave = rawBackgroundVideoUrl
      backgroundImageUrlForSave = null
    } else if (rawBackgroundImageUrl !== '') {
      backgroundImageUrlForSave = rawBackgroundImageUrl
      backgroundVideoUrlForSave = null
    }

    const { data: existing } = await supabaseAdmin
      .from('homepage_settings' as any)
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    let result

    const payload: any = {
      title: rawTitle,
      subtitle: rawSubtitle,
      show_title: showTitle,
      show_subtitle: showSubtitle,
      featured_label:
        rawFeaturedLabel !== '' ? rawFeaturedLabel : 'Featured collection',
      featured_artifact_slug:
        artifactSlugForSave !== null ? artifactSlugForSave : null,
      featured_artwork_slug:
        artworkSlugForSave !== null ? artworkSlugForSave : null,
      background_color:
        rawBackgroundColor !== '' ? rawBackgroundColor : '#000000',
      header_logo_color:
        rawHeaderLogoColor !== '' ? rawHeaderLogoColor : '#000000',
      background_image_url:
        backgroundImageUrlForSave !== null ? backgroundImageUrlForSave : null,
      background_video_url:
        backgroundVideoUrlForSave !== null ? backgroundVideoUrlForSave : null,
      updated_at: now
    }

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('homepage_settings' as any)
        .update(payload)
        .eq('id', (existing as any).id)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      result = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('homepage_settings' as any)
        .insert({
          ...payload,
          created_at: now
        } as any)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving homepage settings:', error)

    return NextResponse.json(
      { error: 'Failed to save homepage settings' },
      { status: 500 }
    )
  }
}
