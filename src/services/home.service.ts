import { BaseService } from './base.service'

export interface HomepageSettings {
  id: string | null
  title: string
  subtitle: string
  show_title: boolean
  show_subtitle: boolean
  featured_label: string
  featured_artifact_slug: string | null
  featured_artwork_slug: string | null
  background_color: string
  header_logo_color: string
  created_at: string | null
  updated_at: string | null
}

export class HomeService extends BaseService {
  static async getHomepageSettings(): Promise<HomepageSettings> {
    const result = await this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('homepage_settings' as any)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if ((error as any).code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data as any
    }, 'getHomepageSettings')

    if (!result) {
      return {
        id: null,
        title: 'Thales Machado',
        subtitle: 'omentejovem',
        show_title: false,
        show_subtitle: true,
        featured_label: 'Featured collection',
        featured_artifact_slug: null,
        featured_artwork_slug: null,
        background_color: '#000000',
        header_logo_color: '#000000',
        created_at: null,
        updated_at: null
      }
    }

    const anyResult = result as any

    return {
      id: anyResult.id ?? null,
      title: anyResult.title ?? 'Thales Machado',
      subtitle: anyResult.subtitle ?? 'omentejovem',
      show_title:
        typeof anyResult.show_title === 'boolean'
          ? anyResult.show_title
          : false,
      show_subtitle:
        typeof anyResult.show_subtitle === 'boolean'
          ? anyResult.show_subtitle
          : true,
      featured_label:
        typeof anyResult.featured_label === 'string' &&
        anyResult.featured_label.trim() !== ''
          ? anyResult.featured_label
          : 'Featured collection',
      featured_artifact_slug:
        typeof anyResult.featured_artifact_slug === 'string' &&
        anyResult.featured_artifact_slug.trim() !== ''
          ? anyResult.featured_artifact_slug
          : null,
      featured_artwork_slug:
        typeof anyResult.featured_artwork_slug === 'string' &&
        anyResult.featured_artwork_slug.trim() !== ''
          ? anyResult.featured_artwork_slug
          : null,
      background_color:
        typeof anyResult.background_color === 'string' &&
        anyResult.background_color.trim() !== ''
          ? anyResult.background_color.trim()
          : '#000000',
      header_logo_color:
        typeof anyResult.header_logo_color === 'string' &&
        anyResult.header_logo_color.trim() !== ''
          ? anyResult.header_logo_color.trim()
          : '#000000',
      created_at: anyResult.created_at ?? null,
      updated_at: anyResult.updated_at ?? null
    }
  }
}
