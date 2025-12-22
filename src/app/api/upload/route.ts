import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { B2_BUCKET_NAME, B2_ENDPOINT, b2Client } from '@/lib/b2'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and content type are required' },
        { status: 400 }
      )
    }

    const command = new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: filename,
      ContentType: contentType
    })

    const signedUrl = await getSignedUrl(b2Client, command, {
      expiresIn: 3600
    })

    const publicUrl = `${B2_ENDPOINT}/${B2_BUCKET_NAME}/${filename}`

    return NextResponse.json({ signedUrl, publicUrl })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}
