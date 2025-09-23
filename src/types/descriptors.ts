import type { Database } from '@/types/supabase'

// Types for descriptors
type FieldType =
  | 'text'
  | 'url'
  | 'email'
  | 'number'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'select'
  | 'switch'
  | 'tiptap'
  | 'slug'
  | 'relation-single'
  | 'relation-multi'
  | 'image'
  | 'json'

type RenderType =
  | 'text'
  | 'image'
  | 'clamp'
  | 'date'
  | 'datetime'
  | 'link'
  | 'badge'
  | 'number'
  | 'boolean'

export interface ListColumn {
  key: string
  label: string
  render: RenderType
  width?: string
  className?: string
}

export interface FormField {
  key: string
  label?: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[] | { value: string; label: string }[]
  when?: Record<string, any>
  from?: string // for slug generation
  relation?: {
    table: string
    labelKey: string
    valueKey?: string
  }
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
  }
  schema?: {
    type: string
    items?: {
      type: string
      properties?: Record<string, any>
      required?: string[]
    }
  }
}

export interface ResourceDescriptor {
  table: keyof Database['public']['Tables']
  title: string
  list: ListColumn[]
  form: FormField[]
  defaultSort?: {
    key: string
    direction: 'asc' | 'desc'
  }
  searchFields?: string[]
  actions?: {
    create?: boolean
    edit?: boolean
    duplicate?: boolean
    delete?: boolean
  }
}

// Artworks Descriptor
export const artworksDescriptor: ResourceDescriptor = {
  table: 'artworks',
  title: 'Artworks',
  list: [
    // Nenhum campo de imagem: resolução via slug/id e helpers
    { key: 'title', label: 'Title', render: 'text' },
    { key: 'mint_date', label: 'Mint Date', render: 'date' },
    { key: 'mint_link', label: 'Mint Link', render: 'link' },
    { key: 'type', label: 'Type', render: 'badge' },
    { key: 'status', label: 'Status', render: 'badge' }
  ],
  form: [
    // Nenhum campo de imagem: resolução via slug/id e helpers
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Enter artwork title'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'slug',
      from: 'title',
      required: true,
      placeholder: 'auto-generated-from-title'
    },
    {
      key: 'token_id',
      label: 'Token ID',
      type: 'text',
      required: false,
      placeholder: 'e.g., 1234'
    },
    {
      key: 'mint_date',
      label: 'Mint Date',
      type: 'date'
    },
    {
      key: 'mint_link',
      label: 'Mint Link',
      type: 'url',
      placeholder: 'https://opensea.io/assets/...'
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'single', label: '1/1 (Single)' },
        { value: 'edition', label: 'Edition' }
      ],
      required: true
    },
    {
      key: 'editions_total',
      label: 'Number of Editions',
      type: 'number',
      when: { type: 'edition' },
      validation: { min: 1 }
    },
    {
      key: 'video_url',
      label: 'Video/Animation URL',
      type: 'url',
      placeholder: 'https://opensea.io/animation.mp4'
    },
    {
      key: 'is_featured',
      label: 'Featured on Home',
      type: 'switch'
    },
    {
      key: 'is_one_of_one',
      label: '1/1 Collection',
      type: 'switch'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'tiptap'
    },
    {
      key: 'blockchain',
      label: 'Blockchain',
      type: 'select',
      options: [
        { value: 'ethereum', label: 'Ethereum' },
        { value: 'tezos', label: 'Tezos' },
        { value: 'polygon', label: 'Polygon' },
        { value: 'solana', label: 'Solana' },
        { value: 'bitcoin', label: 'Bitcoin' }
      ],
      placeholder: 'Select blockchain network'
    },
    {
      key: 'contract_address',
      label: 'Contract Address',
      type: 'text',
      placeholder: '0x123...abc (blockchain contract address)'
    },
    {
      key: 'series',
      label: 'Series',
      type: 'relation-multi',
      relation: {
        table: 'series',
        labelKey: 'name',
        valueKey: 'id'
      }
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ],
      required: true
    }
  ],
  defaultSort: {
    key: 'posted_at',
    direction: 'desc'
  },
  searchFields: ['title', 'token_id'],
  actions: {
    create: true,
    edit: true,
    duplicate: true,
    delete: true
  }
}

// Series Descriptor
export const seriesDescriptor: ResourceDescriptor = {
  table: 'series',
  title: 'Series',
  list: [
    { key: 'name', label: 'Name', render: 'text' },
    // Nenhum campo de imagem: resolução via slug/id e helpers
    { key: 'artworks', label: 'Artworks', render: 'text' }, // Will show count or names
    { key: 'status', label: 'Status', render: 'badge' }
  ],
  form: [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter series name'
    },
    {
      key: 'slug',
      label: 'Slug',
      type: 'slug',
      from: 'name',
      required: true,
      placeholder: 'auto-generated-from-name'
    },

    {
      key: 'artworks',
      label: 'Artworks',
      type: 'relation-multi',
      relation: {
        table: 'artworks',
        labelKey: 'title',
        valueKey: 'id'
      }
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ],
      required: false
    }
  ],
  defaultSort: {
    key: 'created_at',
    direction: 'desc'
  },
  searchFields: ['name'],
  actions: {
    create: true,
    edit: true,
    duplicate: true,
    delete: true
  }
}

// Artifacts Descriptor
export const artifactsDescriptor: ResourceDescriptor = {
  table: 'artifacts',
  title: 'Artifacts',
  list: [
    { key: 'title', label: 'Title', render: 'text' },
    // Nenhum campo de imagem: resolução via slug/id e helpers
    { key: 'status', label: 'Status', render: 'badge' },
    { key: 'link_url', label: 'Link', render: 'link' }
  ],
  form: [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Enter artifact title'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description of the artifact'
    },
    {
      key: 'highlight_video_url',
      label: 'Highlight Video URL',
      type: 'url',
      placeholder: 'https://youtube.com/watch?v=...'
    },
    {
      key: 'link_url',
      label: 'Link URL',
      type: 'url',
      placeholder: 'https://...'
    },
    // Nenhum campo de imagem: resolução via slug/id e helpers
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ],
      required: false
    }
  ],
  defaultSort: {
    key: 'created_at',
    direction: 'desc'
  },
  searchFields: ['title'],
  actions: {
    create: true,
    edit: true,
    duplicate: true,
    delete: true
  }
}

// About Page Descriptor (special case - singleton)
export const aboutPageDescriptor = {
  table: 'about_page' as const,
  title: 'About Page',
  form: [
    {
      key: 'content',
      label: 'About Content',
      type: 'tiptap' as const,
      required: true,
      placeholder:
        'Write about the artist, their background, artistic vision...'
    },
    {
      key: 'socials',
      label: 'Social Media',
      type: 'json' as const,
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            platform: { type: 'string', title: 'Platform' },
            handle: { type: 'string', title: 'Handle' },
            url: { type: 'string', title: 'URL' }
          },
          required: ['platform', 'handle', 'url']
        }
      },
      placeholder: 'Add social media profiles'
    },
    {
      key: 'exhibitions',
      label: 'Exhibitions',
      type: 'json' as const,
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', title: 'Exhibition Title' },
            venue: { type: 'string', title: 'Venue' },
            location: { type: 'string', title: 'Location' },
            year: { type: 'string', title: 'Year' },
            type: {
              type: 'string',
              title: 'Type',
              enum: ['solo', 'group', 'online']
            },
            description: { type: 'string', title: 'Description' }
          },
          required: ['title', 'venue', 'year', 'type']
        }
      },
      placeholder: 'Add exhibition history'
    },
    {
      key: 'press',
      label: 'Press & Media',
      type: 'json' as const,
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', title: 'Article/Interview Title' },
            publication: { type: 'string', title: 'Publication' },
            date: { type: 'string', title: 'Date' },
            url: { type: 'string', title: 'URL' },
            type: {
              type: 'string',
              title: 'Type',
              enum: ['feature', 'interview', 'review', 'news']
            }
          },
          required: ['title', 'publication', 'date', 'type']
        }
      },
      placeholder: 'Add press coverage and media mentions'
    }
  ]
}
