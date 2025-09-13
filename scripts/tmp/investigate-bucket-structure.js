/**
 * Script para investigar a estrutura do bucket Supabase Storage
 * 
 * Este script lista todas as pastas e arquivos no bucket para entender
 * onde estão localizados os arquivos originais das imagens
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente necessárias não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Lista arquivos em uma pasta do bucket
 */
async function listFiles(folder = '', level = 0) {
  try {
    const indent = '  '.repeat(level)
    console.log(`${indent}📁 ${folder || 'root'}/`)
    
    const { data, error } = await supabase.storage
      .from('media')
      .list(folder, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })
    
    if (error) {
      console.error(`${indent}❌ Erro ao listar ${folder}:`, error.message)
      return
    }
    
    if (!data || data.length === 0) {
      console.log(`${indent}  (vazio)`)
      return
    }
    
    // Separar pastas e arquivos
    const folders = data.filter(item => !item.metadata)
    const files = data.filter(item => item.metadata)
    
    // Listar pastas
    for (const folderItem of folders) {
      await listFiles(folder ? `${folder}/${folderItem.name}` : folderItem.name, level + 1)
    }
    
    // Listar arquivos
    if (files.length > 0) {
      console.log(`${indent}  📄 Arquivos (${files.length}):`)
      files.slice(0, 10).forEach(file => {
        const size = Math.round(file.metadata.size / 1024)
        console.log(`${indent}    - ${file.name} (${size}kb)`)
      })
      
      if (files.length > 10) {
        console.log(`${indent}    ... e mais ${files.length - 10} arquivos`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

/**
 * Verifica exemplos de URLs que estão falhando
 */
async function checkExampleUrls() {
  console.log('\n🔍 Verificando URLs de exemplo...\n')
  
  const examples = [
    'https://vhetqzjpjqcqzxlsonax.supabase.co/storage/v1/object/public/media/raw/1757641546911-10_He_Left_as_a_Dot.webp',
    'https://vhetqzjpjqcqzxlsonax.supabase.co/storage/v1/object/public/media/optimized/1757641546911-10_He_Left_as_a_Dot.webp',
    'https://vhetqzjpjqcqzxlsonax.supabase.co/storage/v1/object/public/media/artworks/optimized/1757641546911-10_He_Left_as_a_Dot.webp'
  ]
  
  for (const url of examples) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      console.log(`${response.ok ? '✅' : '❌'} ${url}`)
      if (!response.ok) {
        console.log(`     Status: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ ${url}`)
      console.log(`     Erro: ${error.message}`)
    }
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🔍 Investigando estrutura do bucket Supabase Storage...\n')
  
  try {
    // Listar estrutura completa
    await listFiles()
    
    // Verificar URLs de exemplo
    await checkExampleUrls()
    
  } catch (error) {
    console.error('❌ Erro durante a investigação:', error.message)
  }
}

// Executar
main()
