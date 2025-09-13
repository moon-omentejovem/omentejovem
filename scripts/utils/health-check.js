#!/usr/bin/env node
/**
 * 🔍 Health Check System
 *
 * Verifica integridade do sistema:
 * - Conectividade Supabase
 * - Integridade dos dados
 * - Storage disponível
 * - Performance básica
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function healthCheck() {
  console.log('🏥 Sistema de Health Check - Omentejovem\n')
  console.log('==========================================')

  const results = {
    connectivity: false,
    database: false,
    storage: false,
    integrity: false,
    performance: {
      dbQuery: 0,
      storageList: 0
    },
    issues: []
  }

  // 1. Teste de Conectividade
  console.log('\n🔌 Testando conectividade...')
  try {
    const start = Date.now()
    const { data, error } = await supabase
      .from('artworks')
      .select('id')
      .limit(1)

    results.performance.dbQuery = Date.now() - start

    if (error) {
      throw new Error(error.message)
    }

    results.connectivity = true
    console.log(`✅ Conectividade OK (${results.performance.dbQuery}ms)`)
  } catch (err) {
    results.issues.push(`Conectividade: ${err.message}`)
    console.log('❌ Falha na conectividade:', err.message)
  }

  // 2. Teste de Database
  console.log('\n💾 Testando integridade do banco...')
  try {
    const tables = ['artworks', 'series', 'series_artworks', 'about_page']
    const counts = {}

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) throw new Error(`Erro na tabela ${table}: ${error.message}`)

      counts[table] = count
    }

    results.database = true
    console.log('✅ Database OK')
    console.log(`   📊 artworks: ${counts.artworks}`)
    console.log(`   📚 series: ${counts.series}`)
    console.log(`   🔗 series_artworks: ${counts.series_artworks}`)
    console.log(`   📄 about_page: ${counts.about_page}`)

    // Verificar consistência
    if (counts.artworks === 0) {
      results.issues.push('Nenhum artwork encontrado')
    }
  } catch (err) {
    results.issues.push(`Database: ${err.message}`)
    console.log('❌ Problemas no banco:', err.message)
  }

  // 3. Teste de Storage
  console.log('\n📁 Testando storage...')
  try {
    const start = Date.now()
    const { data: rawFiles, error } = await supabase.storage
      .from('media')
      .list('artworks/raw')

    results.performance.storageList = Date.now() - start

    if (error) throw new Error(error.message)

    const { data: optimizedFiles } = await supabase.storage
      .from('media')
      .list('artworks/optimized')

    results.storage = true
    console.log(`✅ Storage OK (${results.performance.storageList}ms)`)
    console.log(`   📁 Raw files: ${rawFiles?.length || 0}`)
    console.log(`   🚀 Optimized files: ${optimizedFiles?.length || 0}`)
  } catch (err) {
    results.issues.push(`Storage: ${err.message}`)
    console.log('❌ Problemas no storage:', err.message)
  }

  // 4. Teste de Integridade de Dados
  console.log('\n🔍 Testando integridade dos dados...')
  try {
    // Verificar artworks órfãos
    const { data: artworks } = await supabase
      .from('artworks')
      .select('id, title, image_url, contract_address')

    const issues = []

    // Verificar URLs quebradas
    const brokenUrls = artworks.filter(
      (a) =>
        !a.image_url ||
        (!a.image_url.includes('supabase') && !a.image_url.startsWith('/'))
    )

    if (brokenUrls.length > 0) {
      issues.push(`${brokenUrls.length} artworks com URLs problemáticas`)
    }

    // Verificar NFTs sem contract
    const nftsWithoutContract = artworks.filter(
      (a) => a.contract_address === null && a.image_url?.includes('supabase')
    )

    if (nftsWithoutContract.length > 0) {
      issues.push(`${nftsWithoutContract.length} NFTs sem contract_address`)
    }

    if (issues.length === 0) {
      results.integrity = true
      console.log('✅ Integridade OK')
    } else {
      results.issues.push(...issues)
      console.log('⚠️  Issues encontradas:')
      issues.forEach((issue) => console.log(`   - ${issue}`))
    }
  } catch (err) {
    results.issues.push(`Integridade: ${err.message}`)
    console.log('❌ Erro na verificação de integridade:', err.message)
  }

  // 5. Resumo Final
  console.log('\n📊 RESUMO DO HEALTH CHECK')
  console.log('==========================================')

  const allGreen =
    results.connectivity &&
    results.database &&
    results.storage &&
    results.integrity

  console.log(`🎯 Status Geral: ${allGreen ? '✅ SAUDÁVEL' : '⚠️  COM ISSUES'}`)
  console.log(`🔌 Conectividade: ${results.connectivity ? '✅' : '❌'}`)
  console.log(`💾 Database: ${results.database ? '✅' : '❌'}`)
  console.log(`📁 Storage: ${results.storage ? '✅' : '❌'}`)
  console.log(`🔍 Integridade: ${results.integrity ? '✅' : '❌'}`)

  console.log('\n⚡ Performance:')
  console.log(`   DB Query: ${results.performance.dbQuery}ms`)
  console.log(`   Storage List: ${results.performance.storageList}ms`)

  if (results.issues.length > 0) {
    console.log(`\n⚠️  Issues Encontradas (${results.issues.length}):`)
    results.issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`)
    })
  }

  console.log(`\n🕐 Verificação realizada em: ${new Date().toLocaleString()}`)

  return results
}

// Executar automaticamente
healthCheck().catch(console.error)

module.exports = { healthCheck  }
