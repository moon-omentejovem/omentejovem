// scripts/fill-missing-images-from-report.js
// Preenche automaticamente imagens faltantes a partir do image-fill-report.json
// Atualiza apenas registros com imageUrl preenchido

const fs = require('fs')
const path = require('path')
const { createClient } = require('../src/utils/supabase/client')

const REPORT_PATH = path.resolve(__dirname, '../image-fill-report.json')

async function main() {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'))
  const toFill = report.filter((item) => item.imageUrl)
  if (toFill.length === 0) {
    console.log('Nenhum registro com imageUrl para preencher.')
    return
  }

  // Supabase client (assume env vars set)
  const supabase = createClient()

  for (const item of toFill) {
    let table, match, update
    if (item.type === 'artwork') {
      table = 'artworks'
      match = { slug: item.slug }
      update = { image_url: item.imageUrl }
    } else if (item.type === 'series') {
      table = 'series'
      match = { slug: item.slug }
      update = { cover_image_url: item.imageUrl }
    } else if (item.type === 'artifact') {
      table = 'artifacts'
      match = { id: item.id }
      update = { image_url: item.imageUrl }
    } else {
      console.warn('Tipo desconhecido:', item)
      continue
    }
    const { error } = await supabase.from(table).update(update).match(match)
    if (error) {
      console.error(
        `Erro ao atualizar ${table} (${JSON.stringify(match)}):`,
        error.message
      )
    } else {
      console.log(
        `Atualizado ${table} (${JSON.stringify(match)}) com imageUrl.`
      )
    }
  }
  console.log('Preenchimento automático concluído.')
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
