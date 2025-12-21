import { S3Client } from '@aws-sdk/client-s3'

export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || 'omentejovem'
export const B2_ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com'
export const B2_REGION = 'us-east-005' // Extract from endpoint or env

export const b2Client = new S3Client({
  endpoint: B2_ENDPOINT,
  region: B2_REGION,
  forcePathStyle: true, // Force path style for B2 compatibility
  credentials: {
    accessKeyId: process.env.B2_KEY_ID || '',
    secretAccessKey: process.env.B2_APP_KEY || ''
  }
})
