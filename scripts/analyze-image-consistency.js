// Script: analyze-image-consistency.js
// Analisa consistência entre banco de dados (artworks, series, artifacts) e arquivos no Supabase Storage (S3)
// Gera relatório de imagens faltantes, órfãs e inconsistências para migração/correção
// Requer: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL no .env.local

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'media'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Defina SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function fetchTable(table) {
  // Para 'artworks' e 'series' usamos 'slug', para 'artifacts' usamos 'id'
  let field = 'slug'
  if (table === 'artifacts') field = 'id'
  // Busca todos e filtra manualmente para evitar erro de uuid nulo
  const { data, error } = await supabase.from(table).select(`${field}`)
  if (error) throw error
  return (data || []).map((row) => row[field]).filter((v) => v && v !== 'null')
}

async function listFiles(prefix) {
  let files = []
  let page = ''
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { search: page })
    if (error) throw error
    if (!data || data.length === 0) break
    files = files.concat(data.map((f) => f.name))
    break // Supabase Storage não tem paginação real, só simulação
  }
  return files
}

function expectedFiles(keys, type, entity) {
  // type: 'optimized' | 'raw'
  // entity: 'artworks', 'series', 'artifacts'
  if (entity === 'artifacts') {
    // Para artifacts, o padrão é id.webp e id-raw.jpg
    if (type === 'optimized') return keys.map((id) => `${id}.webp`)
    if (type === 'raw') return keys.map((id) => `${id}-raw.jpg`)
  } else {
    // Para artworks/series, o padrão é slug.webp e slug-raw.jpg
    if (type === 'optimized') return keys.map((slug) => `${slug}.webp`)
    if (type === 'raw') return keys.map((slug) => `${slug}-raw.jpg`)
  }
  return []
}

async function analyzeEntity(entity, prefix) {
  const keys = await fetchTable(entity)
  const optimizedFiles = await listFiles(`${prefix}/optimized`)
  const rawFiles = await listFiles(`${prefix}/raw`)

  const expectedOptimized = expectedFiles(keys, 'optimized', entity)
  const expectedRaw = expectedFiles(keys, 'raw', entity)

  const missingOptimized = expectedOptimized.filter(
    (f) => !optimizedFiles.includes(f)
  )
  const missingRaw = expectedRaw.filter((f) => !rawFiles.includes(f))
  const orphanOptimized = optimizedFiles.filter(
    (f) => !expectedOptimized.includes(f)
  )
  const orphanRaw = rawFiles.filter((f) => !expectedRaw.includes(f))

  return {
    entity,
    total: keys.length,
    missingOptimized,
    missingRaw,
    orphanOptimized,
    orphanRaw
  }
}

async function main() {
  const results = []
  for (const [entity, prefix] of [
    ['artworks', 'artworks'],
    ['series', 'series'],
    ['artifacts', 'artifacts']
  ]) {
    results.push(await analyzeEntity(entity, prefix))
  }
  require('fs').writeFileSync(
    'image-consistency-report.json',
    JSON.stringify(results, null, 2)
  )
  console.log('Relatório salvo em image-consistency-report.json')
  results.forEach((r) => {
    console.log(`\n${r.entity.toUpperCase()}`)
    console.log(`Total: ${r.total}`)
    console.log(`Faltando optimized: ${r.missingOptimized.length}`)
    console.log(`Faltando raw: ${r.missingRaw.length}`)
    console.log(`Órfãs optimized: ${r.orphanOptimized.length}`)
    console.log(`Órfãs raw: ${r.orphanRaw.length}`)
  })
}

main().catch((err) => {
  console.error('Erro na análise de consistência:', err)
  process.exit(1)
})
