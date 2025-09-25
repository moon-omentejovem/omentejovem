// scripts/audit-bucket-vs-db.js
// Audita o bucket 'media' e compara com os registros do banco para garantir correspondência
// Lista imagens órfãs, faltantes e inconsistências de nomes/extensões

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listAllFiles(prefix) {
  let files = []
  let page = ''
  while (true) {
    const { data, error } = await supabase.storage.from('media').list(prefix, {
      limit: 1000,
      offset: page ? page.length : 0,
      recursive: true
    })
    if (error) throw error
    if (!data || data.length === 0) break
    files = files.concat(
      data.filter(
        (f) =>
          f.name &&
          (f.name.endsWith('.webp') ||
            f.name.endsWith('.jpg') ||
            f.name.endsWith('.png'))
      )
    )
    if (data.length < 1000) break
    page += data
  }
  return files
}

async function audit(table, prefix) {
  const { data: dbRows, error: dbError } = await supabase
    .from(table)
    .select('id, filename')
  if (dbError) throw dbError
  const dbMap = new Map(dbRows.map((row) => [row.filename, row.id]))

  const files = await listAllFiles(prefix)
  const bucketSet = new Set(files.map((f) => f.name))

  // Arquivos no bucket sem correspondência no banco
  const orfas = files.filter((f) => !dbMap.has(f.name))
  // Registros no banco sem arquivo correspondente
  const faltantes = dbRows.filter((row) => !bucketSet.has(row.filename))

  // Todos os arquivos do bucket
  const allBucketFiles = files.map((f) => f.name)
  // Todos os registros do banco
  const allDbFilenames = dbRows.map((r) => r.filename)

  // Sugerir path antigo provável para cada faltante
  const faltantesDetalhado = faltantes.map((row) => {
    let provavel = ''
    if (table === 'artworks' || table === 'series') {
      provavel = `${table}/${row.id}/raw/${row.filename}`
    } else if (table === 'artifacts') {
      provavel = `artifacts/${row.id}/raw/${row.filename}`
    } else if (table === 'about_page') {
      provavel = `about_page/${row.id}/raw/${row.filename}`
    }
    // Checa padrão do filename
    const padraoId = row.filename && row.filename.startsWith(row.id)
    return { ...row, provavel, padraoId }
  })

  // Checa padrão dos nomes dos arquivos do banco
  const inconsistentes = dbRows.filter(
    (row) => row.filename && !row.filename.includes(row.id)
  )

  return {
    orfas,
    faltantes: faltantesDetalhado,
    inconsistentes,
    totalBucket: files.length,
    totalDb: dbRows.length,
    allBucketFiles,
    allDbFilenames
  }
}

async function main() {
  const fs = require('fs')
  const results = {}
  for (const { table, prefix } of [
    { table: 'artworks', prefix: 'images' },
    { table: 'series', prefix: 'images' },
    { table: 'artifacts', prefix: 'images' },
    { table: 'about_page', prefix: 'images' }
  ]) {
    results[table] = await audit(table, prefix)
  }
  console.log('==== AUDITORIA BUCKET x BANCO ====')
  for (const [table, res] of Object.entries(results)) {
    console.log(`\nTabela: ${table}`)
    console.log(`Imagens no bucket: ${res.totalBucket}`)
    console.log(`Registros no banco: ${res.totalDb}`)
    console.log(
      'Órfãs (no bucket, não no banco):',
      res.orfas.map((f) => f.name)
    )
    console.log(
      'Faltantes (no banco, não no bucket):',
      res.faltantes.map((r) => r.filename)
    )
  }
  // Salva resultado em arquivo JSON para análise posterior
  fs.writeFileSync(
    'audit-bucket-vs-db-result.json',
    JSON.stringify(results, null, 2),
    'utf-8'
  )
  console.log('\nRelatório salvo em audit-bucket-vs-db-result.json')
}

main().catch(console.error)
