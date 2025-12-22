#!/usr/bin/env node
const dotenv = require('dotenv')
const { resolve } = require('path')

dotenv.config()
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const fetch = (...args) =>
  import('node-fetch').then(({ default: f }) => f(...args))

async function main() {
  const keyId = process.env.B2_KEY_ID
  const appKey = process.env.B2_APP_KEY
  const bucketName = process.env.B2_BUCKET_NAME

  if (!keyId || !appKey || !bucketName) {
    console.error('Missing B2_KEY_ID, B2_APP_KEY or B2_BUCKET_NAME in env')
    process.exit(1)
  }

  const basicAuth = Buffer.from(`${keyId}:${appKey}`).toString('base64')

  const authRes = await fetch(
    'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicAuth}`
      }
    }
  )

  if (!authRes.ok) {
    const text = await authRes.text()
    console.error('b2_authorize_account failed', authRes.status, text)
    process.exit(1)
  }

  const authData = await authRes.json()

  const listBucketsRes = await fetch(
    `${authData.apiUrl}/b2api/v2/b2_list_buckets`,
    {
      method: 'POST',
      headers: {
        Authorization: authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: authData.accountId,
        bucketName
      })
    }
  )

  if (!listBucketsRes.ok) {
    const text = await listBucketsRes.text()
    console.error('b2_list_buckets failed', listBucketsRes.status, text)
    process.exit(1)
  }

  const listBucketsData = await listBucketsRes.json()
  const bucket =
    Array.isArray(listBucketsData.buckets) &&
    listBucketsData.buckets.find((b) => b.bucketName === bucketName)

  if (!bucket) {
    console.error('Bucket not found:', bucketName)
    process.exit(1)
  }

  const corsRules = [
    {
      corsRuleName: 'allow-s3-upload-and-download',
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
      allowedOperations: ['s3_get', 's3_put', 's3_head'],
      exposeHeaders: ['x-amz-request-id', 'x-amz-id-2', 'ETag'],
      maxAgeSeconds: 3600
    }
  ]

  const updateRes = await fetch(
    `${authData.apiUrl}/b2api/v2/b2_update_bucket`,
    {
      method: 'POST',
      headers: {
        Authorization: authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: authData.accountId,
        bucketId: bucket.bucketId,
        bucketType: bucket.bucketType,
        corsRules
      })
    }
  )

  if (!updateRes.ok) {
    const text = await updateRes.text()
    console.error('b2_update_bucket failed', updateRes.status, text)
    process.exit(1)
  }

  const updated = await updateRes.json()
  console.log('Updated corsRules for bucket', bucketName)
  console.log(JSON.stringify(updated.corsRules || corsRules, null, 2))
}

main().catch((err) => {
  console.error('Unexpected error', err)
  process.exit(1)
})
