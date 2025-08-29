import { z } from 'zod'

// Rich text content for Tiptap
export const RichTextSchema = z.any() // Tiptap JSON content

// Artwork Schema
export const ArtworkSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: RichTextSchema.nullish(),
  token_id: z.string().min(1).optional().nullable(),
  mint_date: z.string().optional().nullable(),
  mint_link: z.string().url().optional().nullable(),
  type: z.string().min(1), // Changed from enum to match DB
  editions_total: z.number().int().positive().nullable().optional(),
  image_url: z.string().min(1), // Required field to match DB
  is_featured: z.boolean().nullable().optional(),
  is_one_of_one: z.boolean().nullable().optional(),
  posted_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional()
})

// Series Schema
export const SeriesSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  cover_image_url: z.string().url().optional().nullable(),
  cover_image_cached_path: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// Series-Artwork relationship Schema
export const SeriesArtworkSchema = z.object({
  series_id: z.string().uuid(),
  artwork_id: z.string().uuid(),
  created_at: z.string().optional()
})

// Artifact Schema
export const ArtifactSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  highlight_video_url: z.string().url().optional().nullable(),
  link_url: z.string().url().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// About Page Schema
export const AboutPageSchema = z.object({
  id: z.string().uuid().optional(),
  content: RichTextSchema,
  updated_at: z.string().optional()
})

// Form schemas for create/update operations
export const CreateArtworkSchema = ArtworkSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateArtworkSchema = CreateArtworkSchema.partial()

export const CreateSeriesSchema = SeriesSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateSeriesSchema = CreateSeriesSchema.partial()

export const CreateArtifactSchema = ArtifactSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateArtifactSchema = CreateArtifactSchema.partial()

export const UpdateAboutPageSchema = AboutPageSchema.omit({
  id: true,
  updated_at: true
})

// Type exports
export type Artwork = z.infer<typeof ArtworkSchema>
export type Series = z.infer<typeof SeriesSchema>
export type SeriesArtwork = z.infer<typeof SeriesArtworkSchema>
export type Artifact = z.infer<typeof ArtifactSchema>
export type AboutPage = z.infer<typeof AboutPageSchema>

export type CreateArtwork = z.infer<typeof CreateArtworkSchema>
export type UpdateArtwork = z.infer<typeof UpdateArtworkSchema>
export type CreateSeries = z.infer<typeof CreateSeriesSchema>
export type UpdateSeries = z.infer<typeof UpdateSeriesSchema>
export type CreateArtifact = z.infer<typeof CreateArtifactSchema>
export type UpdateArtifact = z.infer<typeof UpdateArtifactSchema>
export type UpdateAboutPage = z.infer<typeof UpdateAboutPageSchema>
