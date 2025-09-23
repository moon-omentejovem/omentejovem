// Script: generate-image-fill-report.js
// Carrega variáveis do .env automaticamente
require('dotenv').config()
// Gera um relatório de correspondências entre imagens faltantes (análise de consistência) e dados antigos (legacy_data)
// Saída: image-fill-report.json

const fs = require('fs')
const path = require('path')

// Carrega dados
const consistency = require('../image-consistency-report.json')
const legacyTokens = require('../public/legacy_data/token-metadata.json')
const legacyMintDates = require('../public/legacy_data/mint-dates.json')

// Helper para normalizar slug (remove acentos, minúsculas, etc)
function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9-]/g, '-')
}

// Busca imagem para artwork slug
function findImageForArtwork(slug) {
  // Procura por nome, slug, ou tokenId
  for (const token of legacyTokens) {
    if (!token || !token.name) continue
    if (normalize(token.name) === slug) {
      // Preferir cachedUrl, depois originalUrl
      return (
        token.image?.cachedUrl ||
        token.image?.originalUrl ||
        token.image?.thumbnailUrl ||
        null
      )
    }
  }
  // fallback: busca por slug em collectionSlug
  for (const token of legacyTokens) {
    if (!token || !token.collection || !token.collection.slug) continue
    if (normalize(token.collection.slug) === slug) {
      return (
        token.image?.cachedUrl ||
        token.image?.originalUrl ||
        token.image?.thumbnailUrl ||
        null
      )
    }
  }
  return null
}

// Busca imagem para series slug
function findImageForSeries(slug) {
  // Busca por collectionSlug
  for (const token of legacyTokens) {
    if (!token || !token.collection || !token.collection.slug) continue
    if (normalize(token.collection.slug) === slug) {
      return (
        token.collection?.openSeaMetadata?.imageUrl ||
        token.collection?.bannerImageUrl ||
        null
      )
    }
  }
  return null
}

// Busca imagem para artifact id (não implementado, placeholder)
function findImageForArtifact(id) {
  // Não há correspondência direta nos dados legacy, retornar null
  return null
}

function buildReport() {
  const report = []
  for (const entity of consistency) {
    if (entity.entity === 'artworks') {
      for (const slug of [...entity.missingOptimized, ...entity.missingRaw]) {
        const baseSlug = slug.replace(/(-raw)?\.(webp|jpg|jpeg|png)$/i, '')
        const imageUrl = findImageForArtwork(baseSlug)
        report.push({ type: 'artwork', slug: baseSlug, file: slug, imageUrl })
      }
    }
    if (entity.entity === 'series') {
      for (const slug of [...entity.missingOptimized, ...entity.missingRaw]) {
        const baseSlug = slug.replace(/(-raw)?\.(webp|jpg|jpeg|png)$/i, '')
        const imageUrl = findImageForSeries(baseSlug)
        report.push({ type: 'series', slug: baseSlug, file: slug, imageUrl })
      }
    }
    if (entity.entity === 'artifacts') {
      for (const id of [...entity.missingOptimized, ...entity.missingRaw]) {
        const baseId = id.replace(/(-raw)?\.(webp|jpg|jpeg|png)$/i, '')
        const imageUrl = findImageForArtifact(baseId)
        report.push({ type: 'artifact', id: baseId, file: id, imageUrl })
      }
    }
  }
  return report
}

function main() {
  const report = buildReport()
  fs.writeFileSync('image-fill-report.json', JSON.stringify(report, null, 2))
  console.log('Relatório salvo em image-fill-report.json')
  const found = report.filter((r) => r.imageUrl)
  const missing = report.filter((r) => !r.imageUrl)
  console.log(`Total: ${report.length}`)
  console.log(`Com correspondência de imagem: ${found.length}`)
  console.log(`Sem correspondência: ${missing.length}`)
}

main()
