import fetch from 'node-fetch'
import { writeFile } from 'fs/promises'
const ALL_NFTS = [
  'KT1NvaAU5oqfvhBcapnE9BbSiWHNVVnKjmHB:13',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:135137',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:135200',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:476826',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:510906',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:240867',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:448564',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton:135181'
]

async function getTezosNFTData(contractAddress, tokenId) {
  try {
    const response = await fetch('https://data.objkt.com/v3/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query MyQuery {
            fa_by_pk(contract: "${contractAddress}") {
              tokens(where: {token_id: {_eq: "${tokenId}"}}) {
                token_id
                artifact_uri
                attributes {
                  id
                }
                average
                content_rating
                creators {
                  verified
                }
                decimals
                description
                dimensions
                display_uri
                extra
                fa_contract
                metadata
                metadata_status
                name
                pk
                rights
                rights_uri
                supply
                symbol
                timestamp
              }
            }
          }
        `
      })
    })

    const data = await response.json()
    const token = data.data?.fa_by_pk?.tokens?.[0]

    if (!token) {
      console.log(`No data found for Tezos NFT ${contractAddress}:${tokenId}`)
      return null
    }

    // Convert IPFS URLs to https format
    const convertIpfsUrl = (url) => {
      if (!url) return null
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    // Fetch IPFS metadata if available
    let ipfsMetadata = null
    if (token.metadata) {
      try {
        const metadataUrl = convertIpfsUrl(token.metadata)
        const metadataResponse = await fetch(metadataUrl)
        ipfsMetadata = await metadataResponse.json()
      } catch (error) {
        console.error(
          `Error fetching IPFS metadata for ${contractAddress}:${tokenId}:`,
          error.message
        )
      }
    }

    // Transform the data to match Ethereum NFT format
    return {
      contract: {
        address: contractAddress,
        name: token.name,
        symbol: token.symbol,
        totalSupply: token.supply?.toString(),
        tokenType: 'FA2', // Tezos equivalent of ERC721
        contractDeployer: null, // Not available in Tezos data
        deployedBlockNumber: null, // Not available in Tezos data
        openSeaMetadata: {
          floorPrice: token.average ? token.average / 1000000 : 0, // Convert from mutez to tez
          collectionName: token.name,
          collectionSlug: null,
          safelistRequestStatus: 'not_requested',
          imageUrl: convertIpfsUrl(token.display_uri || token.artifact_uri),
          description: token.description,
          externalUrl: null,
          twitterUsername: null,
          discordUrl: null,
          bannerImageUrl: null,
          lastIngestedAt: new Date().toISOString()
        },
        isSpam: false,
        spamClassifications: []
      },
      tokenId: token.token_id,
      tokenType: 'FA2',
      name: token.name,
      description: token.description,
      tokenUri: convertIpfsUrl(token.metadata),
      image: {
        cachedUrl: convertIpfsUrl(token.display_uri || token.artifact_uri),
        thumbnailUrl: convertIpfsUrl(token.display_uri || token.artifact_uri),
        pngUrl: convertIpfsUrl(token.display_uri || token.artifact_uri),
        contentType: null, // Not available in Tezos data
        size: null, // Not available in Tezos data
        originalUrl: convertIpfsUrl(token.artifact_uri)
      },
      animation: {
        cachedUrl: null,
        contentType: null,
        size: null,
        originalUrl: null
      },
      raw: {
        tokenUri: convertIpfsUrl(token.metadata),
        metadata: ipfsMetadata || token,
        error: null
      },
      collection: {
        name: token.name,
        slug: null,
        externalUrl: null,
        bannerImageUrl: null
      },
      mint: {
        mintAddress: null,
        blockNumber: null,
        timestamp: token.timestamp,
        transactionHash: null
      },
      owners: null,
      timeLastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error(
      `Error fetching Tezos NFT data for ${contractAddress}:${tokenId}:`,
      error.message
    )
    return {
      contract: {
        address: contractAddress,
        name: null,
        symbol: null,
        totalSupply: null,
        tokenType: 'FA2',
        contractDeployer: null,
        deployedBlockNumber: null,
        openSeaMetadata: null,
        isSpam: false,
        spamClassifications: []
      },
      tokenId: tokenId,
      error: error.message
    }
  }
}

async function processAllNFTs() {
  const results = []

  for (const nft of ALL_NFTS) {
    const [contractAddress, tokenId] = nft.split(':')
    console.log(`Processing ${contractAddress}:${tokenId}...`)

    let result = await getTezosNFTData(contractAddress, tokenId)

    results.push(result)

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(results)

  // Save results to a file using ES modules
  await writeFile('public/tezos-data.json', JSON.stringify(results, null, 2))
  console.log('Results saved to tezos-data.json')
}

Promise.all([processAllNFTs()]).catch(console.error)
