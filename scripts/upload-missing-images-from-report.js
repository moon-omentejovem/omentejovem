// scripts/upload-missing-images-from-report.js
// Para cada item com imageUrl no relatório, faz download da imagem e faz upload para o bucket S3 (Supabase Storage)
// Carrega variáveis do .env automaticamente

require('dotenv').config()
// O caminho de destino é baseado na slug (ou id para artifact)

const fs = require('fs')
const path = require('path')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { createClient } = require('@supabase/supabase-js')

const REPORT_PATH = path.resolve(__dirname, '../image-fill-report.json')
const BUCKET = 'media'

function getStoragePath(item) {
  if (item.type === 'artwork') {
    return `${item.slug}/${item.file}`
  } else if (item.type === 'series') {
    return `series/${item.slug}/${item.file}`
  } else if (item.type === 'artifact') {
    return `artifacts/${item.id}/${item.file}`
  }
  throw new Error('Tipo desconhecido: ' + item.type)
}

async function uploadImage(supabase, item) {
  const storagePath = getStoragePath(item)
  const res = await fetch(item.imageUrl)
  if (!res.ok) throw new Error(`Erro ao baixar ${item.imageUrl}: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      upsert: true,
      contentType: res.headers.get('content-type') || 'image/jpeg'
    })
  if (error)
    throw new Error(
      `Erro ao fazer upload para ${storagePath}: ${error.message}`
    )
  console.log(`Upload concluído: ${storagePath}`)
}

async function main() {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'))
  const toUpload = report.filter((item) => item.imageUrl)
  if (toUpload.length === 0) {
    console.log('Nenhum registro com imageUrl para upload.')
    return
  }
  // Use variáveis de ambiente padrão para Node.js
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.'
    )
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  for (const item of toUpload) {
    try {
      await uploadImage(supabase, item)
    } catch (err) {
      console.error(`Erro no upload de ${item.file}:`, err.message)
    }
  }
  console.log('Uploads finalizados.')
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
