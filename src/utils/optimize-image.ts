'use client'

/**
 * Optimize image file before uploading to storage.
 * Scales down large images and encodes as WebP to reduce size.
 * @param file Original image file
 * @param maxWidth Maximum width in pixels (default 1920)
 * @param quality Output quality between 0 and 1 (default 0.8)
 * @returns Optimized image blob
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return file

  let imageBitmap: ImageBitmap
  try {
    imageBitmap = await createImageBitmap(file)
  } catch {
    return file
  }
  let { width, height } = imageBitmap

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width)
    width = maxWidth
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(imageBitmap, 0, 0, width, height)

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob || file), 'image/webp', quality)
  })
}
