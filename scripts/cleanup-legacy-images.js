// Script para limpar arquivos antigos do Supabase Storage (S3)
// Remove arquivos que não seguem o padrão slug.webp ou slug-raw.jpg
// Necessário: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'media'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function isValidSlugFile(filename, type) {
  // type: 'optimized' ou 'raw'
  if (type === 'optimized') return /^[a-z0-9-]+\.webp$/i.test(filename)
  if (type === 'raw') return /^[a-z0-9-]+-raw\.(jpg|jpeg|png)$/i.test(filename)
  return false
}

async function cleanupFolder(folder) {
  const { data, error } = await supabase.storage.from(BUCKET).list(folder)
  if (error) {
    console.error(`Erro ao listar ${folder}:`, error)
    return
  }
  const toDelete = data
    .filter((file) => !isValidSlugFile(file.name, folder.split('/').pop()))
    .map((file) => `${folder}/${file.name}`)
  if (toDelete.length === 0) {
    console.log(`Nenhum arquivo legado para remover em ${folder}`)
    return
  }
  const { error: delError } = await supabase.storage
    .from(BUCKET)
    .remove(toDelete)
  if (delError) {
    console.error(`Erro ao remover arquivos em ${folder}:`, delError)
  } else {
    console.log(`Removidos ${toDelete.length} arquivos legados de ${folder}`)
  }
}

async function main() {
  await cleanupFolder('artworks/optimized')
  await cleanupFolder('artworks/raw')
  await cleanupFolder('series/optimized')
  await cleanupFolder('series/raw')
  await cleanupFolder('artifacts/optimized')
  await cleanupFolder('artifacts/raw')
  console.log('Limpeza concluída.')
}

main()
