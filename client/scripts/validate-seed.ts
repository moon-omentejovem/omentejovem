import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Types for our data structures
interface TokenMetadata {
  contract: {
    address: string
    name: string
  }
  tokenId: string
  name: string
  description?: string
  image: {
    cachedUrl?: string
    originalUrl?: string
  }
  raw: {
    metadata: {
      image?: string
      image_url?: string
    }
  }
  mint?: {
    timestamp?: string
  }
}

interface MintDate {
  contractAddress: string
  tokenId: string
  mintDate: string
  imageUrl?: string
}

interface TezosData {
  tokenId: string
  name: string
  description?: string
  image: {
    cachedUrl?: string
  }
  mint?: {
    timestamp?: string
  }
  contract: {
    address: string
    name: string
  }
}

interface SeriesData {
  id: string
  slug: string
  name: string
  cover_image_url?: string
}

interface ArtworkData {
  id: string
  slug: string
  title: string
  description: any
  token_id?: string
  mint_date?: string
  mint_link?: string
  type: 'single' | 'edition'
  editions_total?: number
  image_url: string
  is_featured: boolean
  is_one_of_one: boolean
  posted_at: string
}

// Initialize Supabase client (you'll need to set these env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Load and parse JSON files
 */
function loadDataFiles() {
  const publicDir = path.join(process.cwd(), 'public')

  // Load token metadata
  const tokenMetadataPath = path.join(publicDir, 'token-metadata.json')
  const tokenMetadata: TokenMetadata[] = JSON.parse(
    fs.readFileSync(tokenMetadataPath, 'utf8')
  )

  // Load mint dates
  const mintDatesPath = path.join(publicDir, 'mint-dates.json')
  const mintDates: (MintDate | null)[] = JSON.parse(
    fs.readFileSync(mintDatesPath, 'utf8')
  )

  // Load tezos data
  const tezosDataPath = path.join(publicDir, 'tezos-data.json')
  const tezosData: TezosData[] = JSON.parse(
    fs.readFileSync(tezosDataPath, 'utf8')
  )

  // Load NFTs list
  const nftsPath = path.join(publicDir, 'nfts.json')
  const nfts: { nfts: string[] } = JSON.parse(fs.readFileSync(nftsPath, 'utf8'))

  return { tokenMetadata, mintDates, tezosData, nfts }
}

/**
 * Create description JSONB from text
 */
function createDescription(text?: string): any {
  if (!text) return null

  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: text
          }
        ]
      }
    ]
  }
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Map contract addresses to series information
 */
function getSeriesInfo(contractAddress: string): {
  seriesSlug: string
  seriesName: string
  coverImage?: string
} {
  const seriesMap: Record<
    string,
    { seriesSlug: string; seriesName: string; coverImage?: string }
  > = {
    '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43': {
      seriesSlug: 'the-cycle',
      seriesName: 'The Cycle',
      coverImage:
        'https://i.seadn.io/s/raw/files/ed5d5b2508bd188b00832ac86adb57ba.jpg?w=500&auto=format'
    },
    '0xfda33af4770d844dc18d8788c7bf84accfac79ad': {
      seriesSlug: 'omentejovem-1-1s',
      seriesName: 'OMENTEJOVEM 1/1s',
      coverImage:
        'https://i.seadn.io/gcs/files/cacbfeb217dd1be2d79a65a765ca550f.jpg?w=500&auto=format'
    },
    '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50': {
      seriesSlug: 'shapes-colors',
      seriesName: 'Shapes & Colors',
      coverImage:
        'https://i.seadn.io/gcs/files/9d7eb58db2c4fa4cc9dd93273c6d3e51.png?w=500&auto=format'
    },
    '0x28a6f816eae721fea4ad34c000077b5fe525fc3c': {
      seriesSlug: 'omentejovem-editions',
      seriesName: "OMENTEJOVEM's Editions",
      coverImage:
        'https://i.seadn.io/gae/_ZzhhYKfpH4to7PQ0RJkr8REqu_BamJNFNe17NnOkFg1rhFiC_xcioL969hFj5Hri7FIm1hruaKEfUOupzhz3uQk6XwoApIPtgcKFw?w=500&auto=format'
    },
    KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton: {
      seriesSlug: 'tezos-collection',
      seriesName: 'Tezos Collection'
    },
    KT1NvaAU5oqfvhBcapnE9BbSiWHNVVnKjmHB: {
      seriesSlug: 'tezos-collection',
      seriesName: 'Tezos Collection'
    }
  }

  return (
    seriesMap[contractAddress] || {
      seriesSlug: 'other-platforms',
      seriesName: 'Other Platforms'
    }
  )
}

/**
 * Determine if an artwork should be featured
 */
function shouldBeFeatured(
  title: string,
  contractAddress: string,
  tokenId: string
): boolean {
  const featuredPieces = [
    'The Flower',
    'The Seed',
    'The Dot',
    'Sitting at the Edge'
  ]

  return featuredPieces.includes(title)
}

/**
 * Get mint link for a token
 */
function getMintLink(
  contractAddress: string,
  tokenId: string
): string | undefined {
  if (contractAddress.startsWith('KT1')) {
    // Tezos
    return `https://objkt.com/asset/${contractAddress}/${tokenId}`
  } else if (contractAddress.startsWith('0x')) {
    // Ethereum
    return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`
  }
  return undefined
}

/**
 * Process and validate data from legacy files
 */
async function processLegacyData() {
  console.log('📁 Loading data files...')
  const { tokenMetadata, mintDates, tezosData, nfts } = loadDataFiles()

  console.log('🔄 Processing token metadata...')

  // Process Ethereum tokens
  const processedArtworks: ArtworkData[] = []
  const processedSeries: Record<string, SeriesData> = {}

  // Process token metadata
  for (const token of tokenMetadata) {
    const mintInfo = mintDates.find(
      (m) =>
        m &&
        m.contractAddress.toLowerCase() ===
          token.contract.address.toLowerCase() &&
        m.tokenId === token.tokenId
    )

    const seriesInfo = getSeriesInfo(token.contract.address)
    const slug = generateSlug(token.name)

    // Add series if not exists
    if (!processedSeries[seriesInfo.seriesSlug]) {
      processedSeries[seriesInfo.seriesSlug] = {
        id: generateUUID(),
        slug: seriesInfo.seriesSlug,
        name: seriesInfo.seriesName,
        cover_image_url: seriesInfo.coverImage
      }
    }

    const imageUrl =
      token.image.cachedUrl ||
      token.raw.metadata.image_url ||
      token.raw.metadata.image ||
      token.image.originalUrl ||
      mintInfo?.imageUrl ||
      ''

    const artwork: ArtworkData = {
      id: generateUUID(),
      slug: slug,
      title: token.name,
      description: createDescription(token.description),
      token_id: token.tokenId,
      mint_date: mintInfo?.mintDate
        ? mintInfo.mintDate.split('T')[0]
        : undefined,
      mint_link: getMintLink(token.contract.address, token.tokenId),
      type:
        token.contract.address === '0x28a6f816eae721fea4ad34c000077b5fe525fc3c'
          ? 'edition'
          : 'single',
      editions_total:
        token.contract.address === '0x28a6f816eae721fea4ad34c000077b5fe525fc3c'
          ? 50
          : undefined,
      image_url: imageUrl,
      is_featured: shouldBeFeatured(
        token.name,
        token.contract.address,
        token.tokenId
      ),
      is_one_of_one:
        token.contract.address !== '0x28a6f816eae721fea4ad34c000077b5fe525fc3c',
      posted_at: mintInfo?.mintDate || new Date().toISOString()
    }

    processedArtworks.push(artwork)
  }

  // Process Tezos data
  for (const token of tezosData) {
    const seriesInfo = getSeriesInfo(token.contract.address)
    const slug = generateSlug(token.name)

    // Add series if not exists
    if (!processedSeries[seriesInfo.seriesSlug]) {
      processedSeries[seriesInfo.seriesSlug] = {
        id: generateUUID(),
        slug: seriesInfo.seriesSlug,
        name: seriesInfo.seriesName,
        cover_image_url: seriesInfo.coverImage
      }
    }

    const artwork: ArtworkData = {
      id: generateUUID(),
      slug: slug,
      title: token.name,
      description: createDescription(token.description),
      token_id: token.tokenId,
      mint_date: token.mint?.timestamp
        ? token.mint.timestamp.split('T')[0]
        : undefined,
      mint_link: getMintLink(token.contract.address, token.tokenId),
      type: 'edition',
      editions_total: undefined,
      image_url: token.image.cachedUrl || '',
      is_featured: false,
      is_one_of_one: false,
      posted_at: token.mint?.timestamp || new Date().toISOString()
    }

    processedArtworks.push(artwork)
  }

  console.log(`✅ Processed ${Object.keys(processedSeries).length} series`)
  console.log(`✅ Processed ${processedArtworks.length} artworks`)

  return { processedSeries, processedArtworks }
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Validate database after seeding
 */
async function validateDatabase() {
  console.log('🔍 Validating database...')

  try {
    // Check series
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('*')

    if (seriesError) throw seriesError
    console.log(`✅ Found ${series?.length} series in database`)

    // Check artworks
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('*')

    if (artworksError) throw artworksError
    console.log(`✅ Found ${artworks?.length} artworks in database`)

    // Check series-artworks relationships
    const { data: relationships, error: relationshipsError } = await supabase
      .from('series_artworks')
      .select('*')

    if (relationshipsError) throw relationshipsError
    console.log(
      `✅ Found ${relationships?.length} series-artwork relationships`
    )

    // Check featured artworks
    const { data: featured, error: featuredError } = await supabase
      .from('artworks')
      .select('title')
      .eq('is_featured', true)

    if (featuredError) throw featuredError
    console.log(
      `✅ Featured artworks: ${featured?.map((f) => f.title).join(', ')}`
    )

    return true
  } catch (error) {
    console.error('❌ Database validation failed:', error)
    return false
  }
}

/**
 * Generate data validation report
 */
async function generateReport() {
  console.log('📊 Generating data report...')

  const { processedSeries, processedArtworks } = await processLegacyData()

  // Group artworks by series
  const artworksBySeries: Record<string, ArtworkData[]> = {}

  for (const artwork of processedArtworks) {
    // This is simplified - in reality you'd need to match by contract address
    const seriesKey = Object.keys(processedSeries)[0] // Placeholder
    if (!artworksBySeries[seriesKey]) {
      artworksBySeries[seriesKey] = []
    }
    artworksBySeries[seriesKey].push(artwork)
  }

  console.log('\n📈 DATA REPORT')
  console.log('==============')

  Object.entries(processedSeries).forEach(([key, series]) => {
    const artworkCount = artworksBySeries[key]?.length || 0
    console.log(`${series.name}: ${artworkCount} artworks`)
  })

  console.log(
    `\nTotal Featured: ${processedArtworks.filter((a) => a.is_featured).length}`
  )
  console.log(
    `Total 1/1s: ${processedArtworks.filter((a) => a.is_one_of_one).length}`
  )
  console.log(
    `Total Editions: ${processedArtworks.filter((a) => a.type === 'edition').length}`
  )

  const missingImages = processedArtworks.filter((a) => !a.image_url)
  if (missingImages.length > 0) {
    console.log(`\n⚠️  Missing images: ${missingImages.length}`)
    missingImages.forEach((artwork) => {
      console.log(`  - ${artwork.title} (${artwork.token_id})`)
    })
  }

  console.log('\n✅ Report generation complete')
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('🚀 Omentejovem Database Utility')
  console.log('===============================\n')

  switch (command) {
    case 'validate':
      await validateDatabase()
      break

    case 'report':
      await generateReport()
      break

    case 'process':
      await processLegacyData()
      break

    default:
      console.log('Available commands:')
      console.log('  validate  - Validate database after seeding')
      console.log('  report    - Generate data analysis report')
      console.log('  process   - Process legacy data files')
      console.log('\nUsage: tsx scripts/validate-seed.ts <command>')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export {
  createDescription,
  generateReport,
  generateSlug,
  processLegacyData,
  validateDatabase
}
