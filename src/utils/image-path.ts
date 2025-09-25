export interface GeneratedImagePaths {
  identifier: string
  rawFilename: string
  optimizedFilename: string
  rawPath: string
  optimizedPath: string | null
}

export interface GenerateImagePathOptions {
  includeOptimized?: boolean
}

const DEFAULT_IDENTIFIER = 'unknown'
const DEFAULT_FILENAME = 'image'
const DEFAULT_EXTENSION = 'jpg'

function normalizeString(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function cleanSegment(value: string): string {
  const normalized = normalizeString(value.trim())
  const cleaned = normalized
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned || DEFAULT_IDENTIFIER
}

function sanitizeExtension(extension: string): string {
  const cleaned = normalizeString(extension).replace(/[^a-z0-9]+/g, '')
  return cleaned || DEFAULT_EXTENSION
}

export function sanitizeIdentifier(value: string): string {
  return cleanSegment(value)
}

export function sanitizeFilename(filename: string): {
  raw: string
  optimized: string
  base: string
  extension: string
} {
  const trimmed = filename.trim()
  const dotIndex = trimmed.lastIndexOf('.')

  const basePart = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed
  const extensionPart = dotIndex >= 0 ? trimmed.slice(dotIndex + 1) : ''

  const base = cleanSegment(basePart) || DEFAULT_FILENAME
  const extension = sanitizeExtension(extensionPart)

  const raw = `${base}.${extension}`
  const optimized = `${base}.webp`

  return { raw, optimized, base, extension }
}

export function generateImagePaths(
  resourceType: string,
  identifier: string,
  filename: string,
  options: GenerateImagePathOptions = {}
): GeneratedImagePaths {
  const cleanedResource = cleanSegment(resourceType) || 'uploads'
  const cleanedIdentifier = sanitizeIdentifier(identifier)
  const { raw, optimized } = sanitizeFilename(filename)
  const includeOptimized =
    options.includeOptimized ?? cleanedResource !== 'editor'

  const prefix = `${cleanedResource}/${cleanedIdentifier}`
  const rawPath = `${prefix}/raw/${raw}`
  const optimizedPath = includeOptimized
    ? `${prefix}/optimized/${optimized}`
    : null

  return {
    identifier: cleanedIdentifier,
    rawFilename: raw,
    optimizedFilename: optimized,
    rawPath,
    optimizedPath
  }
}
