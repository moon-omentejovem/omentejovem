/**
 * About Service - Server-side about page data fetching
 *
 * Centralized service for about page content management.
 * Handles rich text content, sections, and about page metadata.
 */

import type { Database } from '@/types/supabase'
import { cache } from 'react'
import { BaseService } from './base.service'

// Type definitions
type DatabaseAboutPage = Database['public']['Tables']['about_page']['Row']

export interface AboutPageData {
  id: string
  content: any // JSON content from Tiptap
  socials: Array<{
    platform: string
    handle: string
    url: string
  }>
  exhibitions: Array<{
    title: string
    venue: string
    location: string
    year: string
    type: 'solo' | 'group' | 'online'
    description?: string
  }>
  press: Array<{
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
  aboutPage: AboutPageData | null
  error: null | string
}

/**
 * About Service Class
 */
export class AboutService extends BaseService {
  // Legacy method removido
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
      socials: [],
      exhibitions: [],
      press: [],
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
      const aboutData = null // Legacy data removed

      // If no data found (first time), use defaults
      if (error && error.code === 'PGRST116') {
        const defaultData = this.getDefaultAboutData()
        return {
          aboutPage: defaultData,
          error: null
        }
      }

      if (error) {
        console.error('Error fetching about page data:', error)
        return {
          aboutPage: null,
          error: error.message
        }
      }

      // Parse JSON fields to match AboutPageData types
      const parsedAboutPage: AboutPageData = {
        id: aboutPageData.id,
        content: aboutPageData.content,
        socials: Array.isArray(aboutPageData.socials)
          ? aboutPageData.socials
          : aboutPageData.socials
            ? JSON.parse(aboutPageData.socials as any)
            : [],
        exhibitions: Array.isArray(aboutPageData.exhibitions)
          ? aboutPageData.exhibitions
          : aboutPageData.exhibitions
            ? JSON.parse(aboutPageData.exhibitions as any)
            : [],
        press: Array.isArray(aboutPageData.press)
          ? aboutPageData.press
          : aboutPageData.press
            ? JSON.parse(aboutPageData.press as any)
            : [],
        created_at: aboutPageData.created_at,
        updated_at: aboutPageData.updated_at
      }
      return {
        aboutPage: parsedAboutPage,
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
