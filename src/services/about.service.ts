/**
 * About Service - Server-side about page data fetching
 *
 * Centralized service for about page content management.
 * Handles rich text content, sections, and about page metadata.
 */

import { socialConfigs } from '@/configs/documents'
import type { Database } from '@/types/supabase'
import { cache } from 'react'
import { BaseService } from './base.service'

// Type definitions
type DatabaseAboutPage = Database['public']['Tables']['about_page']['Row']

export interface AboutPageData {
  id: string
  content: any // JSON content from Tiptap
  created_at: string | null
  updated_at: string | null
}

// Legacy AboutData interface for compatibility
export interface AboutData {
  title: string
  subtitle: string
  subtitle_art: string | false
  bio: string
  social_media: {
    twitter: string
    instagram: string
    aotm: string
    superrare: string
    foundation: string
    opensea: string
    objkt: string
  }
  contact: {
    'e-mail': string
  }
}

export interface ProcessedAboutData {
  aboutPage: AboutPageData | null
  aboutData: AboutData | null
  error: null | string
}

/**
 * About Service Class
 */
export class AboutService extends BaseService {
  /**
   * Get default about data for legacy compatibility
   */
  private static getDefaultLegacyAboutData(): AboutData {
    return {
      title: 'THALES MACHADO',
      subtitle: '"omentejovem"',
      subtitle_art: false,
      bio: 'Artist and creator exploring digital narratives through NFTs.',
      social_media: {
        twitter: socialConfigs.find((s) => s.name === 'Twitter')?.link || '',
        instagram:
          socialConfigs.find((s) => s.name === 'Instagram')?.link || '',
        aotm: socialConfigs.find((s) => s.name === 'AOTM')?.link || '',
        superrare:
          socialConfigs.find((s) => s.name === 'SuperRare')?.link || '',
        foundation:
          socialConfigs.find((s) => s.name === 'Foundation')?.link || '',
        opensea: socialConfigs.find((s) => s.name === 'OpenSea')?.link || '',
        objkt: socialConfigs.find((s) => s.name === 'Objkt')?.link || ''
      },
      contact: {
        'e-mail': 'contact@omentejovem.com'
      }
    }
  }

  /**
   * Get default about page data structure
   */
  private static getDefaultAboutData(): AboutPageData {
    return {
      id: 'default',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Welcome to our NFT portfolio. This page is currently being setup.'
              }
            ]
          }
        ]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Get complete about page data
   */
  static getAboutPageData = cache(async (): Promise<ProcessedAboutData> => {
    return this.executeQuery(async (supabase) => {
      const { data: aboutPageData, error } = await supabase
        .from('about_page')
        .select('*')
        .single()

      // Always provide legacy data for compatibility
      const aboutData = this.getDefaultLegacyAboutData()

      // If no data found (first time), use defaults
      if (error && error.code === 'PGRST116') {
        const defaultData = this.getDefaultAboutData()
        return {
          aboutPage: defaultData,
          aboutData,
          error: null
        }
      }

      if (error) {
        console.error('Error fetching about page data:', error)
        return {
          aboutPage: null,
          aboutData,
          error: error.message
        }
      }

      return {
        aboutPage: aboutPageData as AboutPageData,
        aboutData,
        error: null
      }
    }, 'getAboutPageData')
  })

  /**
   * Get about page content only
   */
  static getContent = cache(async () => {
    return this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('about_page')
        .select('content')
        .single()

      if (error && error.code === 'PGRST116') {
        return this.getDefaultAboutData().content
      }

      if (error) {
        console.error('Error fetching about content:', error)
        return null
      }

      return data?.content || null
    }, 'getContent')
  })

  /**
   * Check if about page exists
   */
  static hasAboutPage = cache(async (): Promise<boolean> => {
    return this.executeQuery(async (supabase) => {
      const { count } = await supabase
        .from('about_page')
        .select('*', { count: 'exact', head: true })

      return (count || 0) > 0
    }, 'hasAboutPage')
  })

  /**
   * Get about page metadata (without content)
   */
  static getMetadata = cache(async () => {
    return this.safeExecuteQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('about_page')
        .select('id, created_at, updated_at')
        .single()

      if (error) {
        console.error('Error fetching about metadata:', error)
        return null
      }

      return data
    }, 'getMetadata')
  })
}
