/**
 * About Service - Server-side about page data fetching
 * 
 * Centralized service for about page content, social media links,
 * exhibitions, press mentions, and contact information.
 */

import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import { AboutData, PressTalk } from '@/app/about/@types/wordpress'

// Type definitions
type DatabaseAboutPage = Database['public']['Tables']['about_page']['Row']

export interface AboutPageData {
  id: string
  content: any
  socials?: Array<{
    platform: string
    handle: string
    url: string
  }>
  exhibitions?: Array<{
    title: string
    venue: string
    location: string
    year: string
    type: 'solo' | 'group' | 'online'
    description?: string
  }>
  press?: Array<{
    title: string
    publication: string
    date: string
    url?: string
    type: 'feature' | 'interview' | 'review' | 'news'
  }>
  created_at: string | null
  updated_at: string | null
}

export interface ProcessedAboutData {
  aboutData: AboutData
  aboutPageData: AboutPageData | null
  press: PressTalk[]
  exhibitions: PressTalk[]
  error: string | null
}

/**
 * About Service Class
 */
export class AboutService {
  /**
   * Get fallback/default about data
   */
  private static getDefaultAboutData(): AboutData {
    return {
      title: 'Thales Machado',
      subtitle: 'omentejovem',
      subtitle_art: '',
      bio: '',
      social_media: {
        twitter: 'https://twitter.com/omentejovem',
        instagram: 'https://instagram.com/omentejovem',
        aotm: 'https://aotm.gallery/artist/omentejovem',
        superrare: 'https://superrare.com/omentejovem',
        foundation: 'https://foundation.app/@omentejovem',
        opensea: 'https://opensea.io/omentejovem',
        objkt: 'https://objkt.com/@omentejovem'
      },
      contact: {
        'e-mail': 'contact@omentejovem.com'
      }
    }
  }

  /**
   * Get complete about page data
   */
  static getAboutPageData = cache(async (): Promise<ProcessedAboutData> => {
    const supabase = await createClient()

    try {
      // Fetch about page data from Supabase
      const { data: aboutPageData, error } = await supabase
        .from('about_page')
        .select('*')
        .single()

      // If no data found (first time), use defaults
      if (error && error.code === 'PGRST116') {
        const defaultData = this.getDefaultAboutData()
        return {
          aboutData: defaultData,
          aboutPageData: null,
          press: [],
          exhibitions: [],
          error: null
        }
      }

      // If other error, log and use defaults
      if (error) {
        console.error('Error fetching about page data:', error)
        const defaultData = this.getDefaultAboutData()
        return {
          aboutData: defaultData,
          aboutPageData: null,
          press: [],
          exhibitions: [],
          error: null // Don't expose error to user
        }
      }

      const typedAboutPageData = aboutPageData as AboutPageData | null

      // Transform database data to expected format
      const aboutData: AboutData = this.getDefaultAboutData()

      // Merge socials from database if available
      if (typedAboutPageData?.socials && Array.isArray(typedAboutPageData.socials)) {
        typedAboutPageData.socials.forEach((social) => {
          const platform = social.platform?.toLowerCase()
          if (platform && aboutData.social_media.hasOwnProperty(platform)) {
            (aboutData.social_media as any)[platform] = social.url
          }
        })
      }

      // Transform press to PressTalk format
      const press: PressTalk[] = typedAboutPageData?.press?.map((pressItem) => ({
        title: {
          rendered: pressItem.title
        },
        acf: {
          link: pressItem.url || '#'
        }
      })) || []

      // Transform exhibitions to PressTalk format
      const exhibitions: PressTalk[] = typedAboutPageData?.exhibitions?.map((exhibition) => ({
        title: {
          rendered: `${exhibition.title} - ${exhibition.venue} (${exhibition.year})`
        },
        acf: {
          link: '#'
        }
      })) || []

      return {
        aboutData,
        aboutPageData: typedAboutPageData,
        press,
        exhibitions,
        error: null
      }
    } catch (error) {
      console.error('Unexpected error in getAboutPageData:', error)
      
      // Always return fallback data on any error
      const defaultData = this.getDefaultAboutData()
      return {
        aboutData: defaultData,
        aboutPageData: null,
        press: [],
        exhibitions: [],
        error: null
      }
    }
  })

  /**
   * Get about content only (for quick access)
   */
  static getAboutContent = cache(async () => {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase
        .from('about_page')
        .select('content')
        .single()

      if (error) {
        console.error('Error fetching about content:', error)
        return null
      }

      return data?.content || null
    } catch (error) {
      console.error('Unexpected error in getAboutContent:', error)
      return null
    }
  })

  /**
   * Get social media links only
   */
  static getSocialLinks = cache(async () => {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase
        .from('about_page')
        .select('socials')
        .single()

      if (error) {
        console.error('Error fetching social links:', error)
        return this.getDefaultAboutData().social_media
      }

      const typedData = data as { socials?: AboutPageData['socials'] }
      const defaultSocials = this.getDefaultAboutData().social_media

      // Merge database socials with defaults
      if (typedData?.socials && Array.isArray(typedData.socials)) {
        typedData.socials.forEach((social) => {
          const platform = social.platform?.toLowerCase()
          if (platform && defaultSocials.hasOwnProperty(platform)) {
            (defaultSocials as any)[platform] = social.url
          }
        })
      }

      return defaultSocials
    } catch (error) {
      console.error('Unexpected error in getSocialLinks:', error)
      return this.getDefaultAboutData().social_media
    }
  })

  /**
   * Get contact information
   */
  static getContactInfo = cache(async () => {
    // Contact info is currently static, but this allows for future dynamic content
    return {
      email: 'contact@omentejovem.com',
      // Add other contact methods as needed
    }
  })

  /**
   * Check if about page has custom content
   */
  static hasCustomContent = cache(async (): Promise<boolean> => {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase
        .from('about_page')
        .select('id')
        .single()

      return !error && data !== null
    } catch (error) {
      return false
    }
  })
}
