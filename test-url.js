const https = require('https')
const http = require('http')

const imageUrl =
  'https://vhetqzjpjqcqzxlsonax.supabase.co/storage/v1/object/public/media/artworks/optimized/1757640948476-the-ground-was-my-teacher.webp'

console.log('Testing URL:', imageUrl)

const protocol = imageUrl.startsWith('https:') ? https : http

const req = protocol.get(imageUrl, (res) => {
  console.log('Status Code:', res.statusCode)
  console.log('Content-Type:', res.headers['content-type'])
  console.log('Content-Length:', res.headers['content-length'])

  if (res.statusCode === 200) {
    console.log('✅ URL is accessible')
  } else {
    console.log('❌ URL returned error status')
  }
})

req.on('error', (error) => {
  console.log('❌ Network error:', error.message)
})

req.setTimeout(5000, () => {
  console.log('❌ Request timeout')
  req.abort()
})
