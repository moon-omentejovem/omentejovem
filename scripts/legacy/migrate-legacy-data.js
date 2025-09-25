#!/usr/bin/env node
/**
 * Legacy Data Migration Script
 * --------------------------------------
 * Converte JSONs em `public/legacy_data` para registros nas tabelas atuais:
 *  - artworks
 *  - series (The Cycle, OMENTEJOVEM 1/1s, Shapes & Colors, Editions, Tezos)
 *  - series_artworks (relacionamentos)
 *
 * Regras principais:
 *  - Idempotente: usa upsert por slug
 *  - Gera slug derivado do nome (kebab-case) + fallback contract:tokenId
 *  - Define type: 'single' para ERC721 / FA2 supply 1, 'edition' para ERC1155 ou supply > 1
 *  - Marca is_one_of_one=true quando edição única
 *  - posted_at = mint_date
 *  - mint_link derivado (OpenSea principal ou placeholder)
 *  - Não lida com imagens (seguindo novo padrão sem colunas de imagem); resolução ocorre via storage conventions futuramente
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    '❌ Variáveis Supabase ausentes. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Series base (garantimos existência)
const CORE_SERIES = [
  { slug: 'the-cycle', name: 'The Cycle' },
  { slug: 'omentejovem-1-1s', name: 'OMENTEJOVEM 1/1s' },
  { slug: 'shapes-and-colors', name: 'Shapes & Colors' },
  { slug: 'editions', name: 'Editions' },
  { slug: 'tezos', name: 'Tezos Works' }
]

const DEFAULT_IMAGE_EXTENSION = 'jpg'

function slugify(str) {
  return str
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function normalizeString(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function cleanSegment(value = '') {
  const normalized = normalizeString(String(value).trim())
  const cleaned = normalized
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned || 'image'
}

function sanitizeExtension(extension = DEFAULT_IMAGE_EXTENSION) {
  const cleaned = normalizeString(extension).replace(/[^a-z0-9]+/g, '')
  return cleaned || DEFAULT_IMAGE_EXTENSION
}

function buildImageFilename(base, extension = DEFAULT_IMAGE_EXTENSION) {
  const sanitizedBase = cleanSegment(base)
  const sanitizedExtension = sanitizeExtension(extension)
  return `${sanitizedBase}.${sanitizedExtension}`
}

function safeReadJSON(file) {
  const full = path.join(process.cwd(), 'public', 'legacy_data', file)
  if (!fs.existsSync(full)) return null
  try {
    return JSON.parse(fs.readFileSync(full, 'utf-8'))
  } catch (e) {
    console.warn('⚠️ Erro parse JSON', file, e.message)
    return null
  }
}

function buildMintLink(chain, contract, tokenId) {
  if (!contract || !tokenId) return null
  if (chain === 'ethereum') {
    return `https://opensea.io/assets/ethereum/${contract.toLowerCase()}/${tokenId}`
  }
  if (chain === 'tezos') {
    return `https://objkt.com/asset/${contract}/${tokenId}`
  }
  return null
}

async function ensureSeries() {
  for (const s of CORE_SERIES) {
    let existing = null

    const { data: existingSeries, error: fetchError } = await supabase
      .from('series')
      .select('id, slug, image_filename')
      .eq('slug', s.slug)
      .maybeSingle()

    if (fetchError) {
      console.warn('⚠️ Series fetch error', s.slug, fetchError.message)
    } else {
      existing = existingSeries
    }

    const imageFilename = existing?.image_filename
      ? existing.image_filename
      : buildImageFilename(s.slug, DEFAULT_IMAGE_EXTENSION)

    const payload = {
      slug: s.slug,
      name: s.name,
      image_filename: imageFilename
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('series')
        .update(payload)
        .eq('id', existing.id)

      if (updateError) {
        console.warn('⚠️ Series update error', s.slug, updateError.message)
      }
    } else {
      const { error: insertError } = await supabase
        .from('series')
        .insert(payload)

      if (insertError) {
        console.warn('⚠️ Series insert error', s.slug, insertError.message)
      }
    }
  }

  const { data } = await supabase.from('series').select('id, slug')
  const map = {}
  data?.forEach((r) => (map[r.slug] = r.id))
  return map
}

function mapTokenEntry(entry, chain = 'ethereum') {
  if (!entry) return null
  const contract = entry.contract?.address || entry.contractAddress
  const tokenId = entry.tokenId || entry.token_id || entry.tokenID
  const name = entry.name || entry.metadata?.name || entry.raw?.metadata?.name
  const collectionName =
    entry.contract?.openSeaMetadata?.collectionName || entry.contract?.name
  const collectionSlug = entry.contract?.openSeaMetadata?.collectionSlug || null
  // Determine series
  let seriesSlug = null
  if (collectionSlug === 'the3cycle' || /cycle/i.test(collectionName))
    seriesSlug = 'the-cycle'
  else if (
    collectionSlug === 'omentejovem' ||
    /omentejovem/i.test(collectionName)
  )
    seriesSlug = 'omentejovem-1-1s'
  else if (/shapes?\s*&?\s*colors?/i.test(collectionName))
    seriesSlug = 'shapes-and-colors'
  else if (/edition/i.test(collectionName) || entry.tokenType === 'ERC1155')
    seriesSlug = 'editions'
  else if (chain === 'tezos') seriesSlug = 'tezos'

  const supply = parseInt(entry.contract?.totalSupply || '1', 10)
  const isEdition =
    entry.tokenType === 'ERC1155' ||
    supply > 1 ||
    (entry.tokenType === 'FA2' && supply > 1)
  const type = isEdition ? 'edition' : 'single'
  const isOneOfOne = !isEdition

  // Mint date prioritization
  const mintDate = entry.mint?.timestamp || entry.mintDate || null
  const postedAt = mintDate || new Date().toISOString()

  const title = name || `${collectionName || 'Artwork'} #${tokenId}`
  const baseSlug = slugify(title)
  const slug = baseSlug || slugify(`${contract}-${tokenId}`)

  const imageFilename = buildImageFilename(
    slug || title,
    DEFAULT_IMAGE_EXTENSION
  )

  return {
    slug,
    title: title.trim(),
    token_id: tokenId ? String(tokenId) : null,
    contract_address: contract || null,
    blockchain: chain,
    collection_slug: collectionSlug,
    mint_date: mintDate,
    posted_at: postedAt,
    mint_link: buildMintLink(chain, contract, tokenId),
    type,
    is_featured: false,
    is_one_of_one: isOneOfOne,
    status: 'published',
    seriesSlug,
    image_filename: imageFilename
  }
}

function loadAllTokens() {
  const tokenMetadata = safeReadJSON('token-metadata.json') || []
  const mintDates = safeReadJSON('mint-dates.json') || []
  const tezosData = safeReadJSON('tezos-data.json') || []

  // Index mint dates by contract+token
  const mintIndex = new Map()
  mintDates.forEach((m) => {
    if (m && m.contractAddress && m.tokenId) {
      mintIndex.set(`${m.contractAddress.toLowerCase()}:${m.tokenId}`, m)
    }
  })

  const mapped = []
  for (const entry of tokenMetadata) {
    const mappedBase = mapTokenEntry(entry, 'ethereum')
    if (!mappedBase) continue
    // Enhance with mintDate override if exists
    const key = `${(mappedBase.contract_address || '').toLowerCase()}:${mappedBase.token_id}`
    const md = mintIndex.get(key)
    if (md && md.mintDate) {
      mappedBase.mint_date = md.mintDate
      mappedBase.posted_at = md.mintDate
    }
    mapped.push(mappedBase)
  }

  for (const entry of tezosData) {
    const mappedTezos = mapTokenEntry(entry, 'tezos')
    if (mappedTezos) mapped.push(mappedTezos)
  }

  return mapped
}

async function upsertArtworks(artworks, seriesIdMap) {
  let inserted = 0
  let skipped = 0
  const rels = []

  for (const art of artworks) {
    // Check existing by slug
    const { data: existing, error: fetchErr } = await supabase
      .from('artworks')
      .select('id, slug, image_filename')
      .eq('slug', art.slug)
      .maybeSingle()
    if (fetchErr) {
      console.warn('⚠️ Fetch error', art.slug, fetchErr.message)
      continue
    }

    if (existing) {
      if (!existing.image_filename && art.image_filename) {
        const { error: updateErr } = await supabase
          .from('artworks')
          .update({ image_filename: art.image_filename })
          .eq('id', existing.id)

        if (updateErr) {
          console.warn('⚠️ image_filename update error', art.slug, updateErr.message)
        } else {
          console.log('📝 image_filename definido para', art.slug)
        }
      }
      skipped++
      continue
    }

    const { data: insertedRow, error: insertErr } = await supabase
      .from('artworks')
      .insert({
        slug: art.slug,
        title: art.title,
        token_id: art.token_id,
        contract_address: art.contract_address,
        blockchain: art.blockchain,
        collection_slug: art.collection_slug,
        mint_date: art.mint_date,
        posted_at: art.posted_at,
        mint_link: art.mint_link,
        type: art.type,
        is_featured: art.is_featured,
        is_one_of_one: art.is_one_of_one,
        status: art.status,
        image_filename: art.image_filename
      })
      .select()
      .single()

    if (insertErr) {
      console.warn('⚠️ Insert error', art.slug, insertErr.message)
      continue
    }

    inserted++

    if (art.seriesSlug && seriesIdMap[art.seriesSlug]) {
      rels.push({
        artwork_id: insertedRow.id,
        series_id: seriesIdMap[art.seriesSlug]
      })
    }
  }

  // Batch insert relations
  if (rels.length > 0) {
    const { error: relErr } = await supabase
      .from('series_artworks')
      .insert(rels)
    if (relErr) console.warn('⚠️ Relation insert error', relErr.message)
  }

  return { inserted, skipped }
}

async function migrateLegacyData() {
  console.log('🚀 Iniciando migração de dados legados...')

  const seriesMap = await ensureSeries()
  console.log('✅ Séries garantidas.')

  const tokens = loadAllTokens()
  console.log(`📦 Tokens carregados: ${tokens.length}`)

  const { inserted, skipped } = await upsertArtworks(tokens, seriesMap)

  console.log('🎨 Artworks inseridos:', inserted)
  console.log('⏭️ Artworks já existentes (skipped):', skipped)
  console.log('✅ Migração concluída.')
}

if (require.main === module) {
  migrateLegacyData().catch((e) => {
    console.error('❌ Falha na migração', e)
    process.exit(1)
  })
}

module.exports = { migrateLegacyData }
