// scripts/dump-bucket-and-db-structure.js
// Faz um dump básico da estrutura do bucket S3 (Supabase Storage) e das tabelas do banco, salvando tudo em um JSON para análise.
// Uso: node scripts/dump-bucket-and-db-structure.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BUCKET = 'media' // ou 'images' se já estiver migrado
const OUTPUT = 'bucket-db-structure-sample.json'

async function listAllFiles(prefix = '') {
  let files = []
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix)
  if (error) throw error
  if (!data) return files
  const fileExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov']
  for (const item of data) {
    const isFile = fileExts.some(
      (ext) => item.name && item.name.toLowerCase().endsWith(ext)
    )
    if (!isFile) {
      // Trata como pasta se não for arquivo conhecido
      // Log para depuração
      console.log(
        'Descendo em subpasta:',
        prefix ? `${prefix}/${item.name}` : item.name
      )
      const subFiles = await listAllFiles(
        prefix ? `${prefix}/${item.name}` : item.name
      )
      files = files.concat(subFiles)
    } else {
      files.push({
        name: item.name,
        id: item.id,
        path: prefix ? `${prefix}/${item.name}` : item.name,
        updated_at: item.updated_at,
        metadata: item.metadata || null,
        type: item.type
      })
    }
  }
  return files
}

async function dumpDbTable(table, fields) {
  const { data, error } = await supabase.from(table).select(fields.join(','))
  if (error) throw error
  return data
}

async function main() {
  const bucketFiles = await listAllFiles('') // dump completo do bucket
  const artworks = await dumpDbTable('artworks', [
    'id',
    'slug',
    'filename',
    'imageurl',
    'title',
    'status',
    'created_at',
    'updated_at'
  ])
  const series = await dumpDbTable('series', [
    'id',
    'slug',
    'filename',
    'imageurl',
    'name',
    'created_at',
    'updated_at'
  ])
  const artifacts = await dumpDbTable('artifacts', [
    'id',
    'title',
    'filename',
    'imageurl',
    'status',
    'created_at',
    'updated_at'
  ])
  const about = await dumpDbTable('about_page', [
    'id',
    'filename',
    'imageurl',
    'created_at',
    'updated_at'
  ])

  const dump = {
    bucket: bucketFiles,
    db: { artworks, series, artifacts, about }
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(dump, null, 2))
  console.log(`Estrutura salva em ${OUTPUT}`)
}

main().catch(console.error)
