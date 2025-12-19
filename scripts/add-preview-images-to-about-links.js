#!/usr/bin/env node

/**
 * Script para adicionar data-preview-image aos links da página About
 * 
 * Este script:
 * 1. Busca o conteúdo atual da página About no Supabase
 * 2. Encontra todos os links no conteúdo TipTap
 * 3. Adiciona o atributo data-preview-image aos links especificados
 * 4. Atualiza o conteúdo no banco de dados
 * 
 * Uso:
 *   node scripts/add-preview-images-to-about-links.js
 * 
 * O script irá mostrar os links encontrados e pedir confirmação antes de atualizar.
 */

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Configuração do Supabase (usando anon key - funciona para leitura pública)
// Para escrita, precisamos de permissões adequadas ou service role key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhetqzjpjqcqzxlsonax.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZXRxempwanFjcXp4bHNvbmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTQ0NTcsImV4cCI6MjA3MTkzMDQ1N30.O0k5AQvQh9ih86YhK7oKmkOQLPX4NC8SeIKOhUA98XI'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Mapeamento de links para suas imagens de preview
// CONFIGURE AQUI: Adicione os links e suas respectivas URLs de imagem
const LINK_PREVIEW_MAP = {
  // Exemplo: '/series/the-day-i-found-out': 'https://url-da-imagem-preview.jpg'
  // Adicione seus links aqui:
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

/**
 * Percorre recursivamente o conteúdo TipTap e encontra todos os links
 */
function findLinks(content, links = []) {
  if (!content) return links
  
  if (Array.isArray(content)) {
    for (const item of content) {
      findLinks(item, links)
    }
  } else if (typeof content === 'object') {
    // Verifica se é um nó de texto com marca de link
    if (content.marks) {
      for (const mark of content.marks) {
        if (mark.type === 'link' && mark.attrs?.href) {
          links.push({
            href: mark.attrs.href,
            text: content.text || '',
            mark: mark,
            hasPreviewImage: !!mark.attrs['data-preview-image']
          })
        }
      }
    }
    
    // Percorre o conteúdo filho
    if (content.content) {
      findLinks(content.content, links)
    }
  }
  
  return links
}

/**
 * Adiciona data-preview-image aos links no conteúdo TipTap
 */
function addPreviewImagesToContent(content, previewMap) {
  if (!content) return content
  
  if (Array.isArray(content)) {
    return content.map(item => addPreviewImagesToContent(item, previewMap))
  } else if (typeof content === 'object') {
    const newContent = { ...content }
    
    // Verifica se é um nó de texto com marca de link
    if (newContent.marks) {
      newContent.marks = newContent.marks.map(mark => {
        if (mark.type === 'link' && mark.attrs?.href) {
          const previewImage = previewMap[mark.attrs.href]
          if (previewImage) {
            return {
              ...mark,
              attrs: {
                ...mark.attrs,
                'data-preview-image': previewImage
              }
            }
          }
        }
        return mark
      })
    }
    
    // Percorre o conteúdo filho
    if (newContent.content) {
      newContent.content = addPreviewImagesToContent(newContent.content, previewMap)
    }
    
    return newContent
  }
  
  return content
}

async function main() {
  console.log('\n🔍 Buscando conteúdo da página About...\n')
  
  // Busca o conteúdo atual
  const { data: aboutPage, error: fetchError } = await supabase
    .from('about_page')
    .select('*')
    .limit(1)
    .single()
  
  if (fetchError) {
    console.error('❌ Erro ao buscar página About:', fetchError.message)
    process.exit(1)
  }
  
  if (!aboutPage) {
    console.error('❌ Página About não encontrada')
    process.exit(1)
  }
  
  console.log('✅ Página About encontrada (ID:', aboutPage.id, ')\n')
  
  // Encontra todos os links
  const links = findLinks(aboutPage.content)
  
  if (links.length === 0) {
    console.log('ℹ️ Nenhum link encontrado no conteúdo.')
    process.exit(0)
  }
  
  console.log('📝 Links encontrados no conteúdo:\n')
  console.log('=' .repeat(60))
  
  links.forEach((link, index) => {
    console.log(`\n[${index + 1}] "${link.text}"`)
    console.log(`    URL: ${link.href}`)
    console.log(`    Preview Image: ${link.hasPreviewImage ? '✅ Configurado' : '❌ Não configurado'}`)
    if (link.mark.attrs['data-preview-image']) {
      console.log(`    Preview URL: ${link.mark.attrs['data-preview-image']}`)
    }
  })
  
  console.log('\n' + '=' .repeat(60))
  
  // Verifica se há links sem preview configurado
  const linksWithoutPreview = links.filter(l => !l.hasPreviewImage)
  
  if (linksWithoutPreview.length === 0) {
    console.log('\n✅ Todos os links já têm imagem de preview configurada!')
    process.exit(0)
  }
  
  console.log(`\n⚠️ ${linksWithoutPreview.length} link(s) sem imagem de preview configurada.`)
  
  // Modo interativo para configurar os links
  const rl = createReadlineInterface()
  
  console.log('\n📝 Vamos configurar as imagens de preview para cada link.\n')
  console.log('Para cada link, digite a URL da imagem de preview ou pressione Enter para pular.\n')
  
  const previewMap = { ...LINK_PREVIEW_MAP }
  
  for (const link of linksWithoutPreview) {
    console.log(`\nLink: "${link.text}"`)
    console.log(`URL do link: ${link.href}`)
    
    const previewUrl = await askQuestion(rl, 'URL da imagem de preview (Enter para pular): ')
    
    if (previewUrl.trim()) {
      previewMap[link.href] = previewUrl.trim()
      console.log('✅ Preview configurado!')
    } else {
      console.log('⏭️ Pulando...')
    }
  }
  
  // Verifica se há algum preview para adicionar
  const linksToUpdate = Object.keys(previewMap).filter(href => 
    links.some(l => l.href === href && !l.hasPreviewImage)
  )
  
  if (linksToUpdate.length === 0) {
    console.log('\nℹ️ Nenhuma alteração a fazer.')
    rl.close()
    process.exit(0)
  }
  
  console.log(`\n📋 Resumo das alterações:`)
  for (const href of linksToUpdate) {
    const link = links.find(l => l.href === href)
    console.log(`  • "${link?.text}" -> ${previewMap[href]}`)
  }
  
  const confirm = await askQuestion(rl, '\nDeseja aplicar essas alterações? (s/N): ')
  
  if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
    console.log('\n❌ Operação cancelada.')
    rl.close()
    process.exit(0)
  }
  
  // Aplica as alterações
  console.log('\n🔄 Aplicando alterações...')
  
  const updatedContent = addPreviewImagesToContent(aboutPage.content, previewMap)
  
  const { error: updateError } = await supabase
    .from('about_page')
    .update({ content: updatedContent })
    .eq('id', aboutPage.id)
  
  if (updateError) {
    console.error('❌ Erro ao atualizar:', updateError.message)
    rl.close()
    process.exit(1)
  }
  
  console.log('\n✅ Alterações aplicadas com sucesso!')
  console.log('\n🔄 Recarregue a página /about para ver as mudanças.')
  
  rl.close()
}

main().catch(console.error)