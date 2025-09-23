// scripts/download-and-upload-matched-images.js
// Baixa imagens com imageUrl do relatório e faz upload para o Supabase Storage no caminho correto
// Usa o novo padrão de path do projeto

require('dotenv').config()
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

async function downloadImage(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao baixar ${url}: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  fs.writeFileSync(destPath, buffer)
}

async function uploadImage(supabase, item, localPath) {
  const storagePath = getStoragePath(item)
  const buffer = fs.readFileSync(localPath)
  const contentType = item.file.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      upsert: true,
      contentType
    })
  if (error)
    throw new Error(
      `Erro ao fazer upload para ${storagePath}: ${error.message}`
    )
  console.log(`Upload concluído: ${storagePath}`)
}

async function main() {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'))
  const toProcess = report.filter((item) => item.imageUrl)
  if (toProcess.length === 0) {
    console.log('Nenhuma imagem para baixar e subir.')
    return
  }
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.'
    )
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const tmpDir = path.resolve(__dirname, '../tmp_downloaded_images')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
  const log = []
  for (const item of toProcess) {
    const localPath = path.join(tmpDir, item.file)
    const logEntry = {
      file: item.file,
      type: item.type,
      slug: item.slug,
      id: item.id,
      imageUrl: item.imageUrl,
      storagePath: getStoragePath(item)
    }
    try {
      await downloadImage(item.imageUrl, localPath)
      logEntry.download = 'ok'
    } catch (err) {
      logEntry.download = 'erro'
      logEntry.downloadError = err.message
      log.push(logEntry)
      console.error(`Erro no download de ${item.file}:`, err.message)
      continue
    }
    try {
      await uploadImage(supabase, item, localPath)
      logEntry.upload = 'ok'
    } catch (err) {
      logEntry.upload = 'erro'
      logEntry.uploadError = err.message
      console.error(`Erro no upload de ${item.file}:`, err.message)
    }
    log.push(logEntry)
  }
  fs.writeFileSync(
    path.resolve(__dirname, '../download-upload-log.json'),
    JSON.stringify(log, null, 2)
  )
  console.log(
    'Download e upload finalizados. Log salvo em download-upload-log.json.'
  )
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
