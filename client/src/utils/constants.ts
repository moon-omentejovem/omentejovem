import { NFT } from '@/api/resolver/types'

export const COLLECTION_NFTS = [
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:5',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:6',
  '0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:1',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:2',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:3',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:4',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:5',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:6',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:7',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:8',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:9',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10'
]

export const STORIES_ON_CIRCLES_COLLECTION_ADDRESS =
  '0x0000000000000000000000000000000000000000'

export const STORIES_ON_CIRCLES_SLUG = 'storiesoncircles'

export const FAKE_TOKENS: NFT[] = [
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:1`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '4',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '1',
    tokenType: 'ERC721',
    name: 'Sitting at the Edge',
    description: 'In the middle of the seen and unseen.',
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
      thumbnailUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
      pngUrl: '/new_series/1_Sitting_at_the_Edge.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/1_Sitting_at_the_Edge.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/1_Sitting_at_the_Edge.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: 'Sitting at the Edge',
        description: 'In the middle of the seen and unseen.',
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-04-28T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:2`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '4',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '2',
    tokenType: 'ERC721',
    name: 'Two Voices, One Circle',
    description: 'One speaks, the other feels.',
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
      thumbnailUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
      pngUrl: '/new_series/2_Two_Voices,_One_Circle.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/2_Two_Voices,_One_Circle.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/2_Two_Voices,_One_Circle.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: 'Two Voices, One Circle',
        description: 'One speaks, the other feels.',
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-04-30T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:3`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '4',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '3',
    tokenType: 'ERC721',
    name: 'The Ground Was My Teacher',
    description: `I enjoyed playing with kites in my childhood. Fun fact, most of them didn't even get to fly. I ended up hurting my knee hundreds of times as the kites still got destroyed. Thankfully I could craft other toys with their sticks and strings.
Ironically, i feel that's still the life i live.`,
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
      thumbnailUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
      pngUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/3_The_Ground_Was_My_Teacher.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/3_The_Ground_Was_My_Teacher.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: 'The Ground Was My Teacher',
        description: `I enjoyed playing with kites in my childhood. Fun fact, most of them didn't even get to fly. I ended up hurting my knee hundreds of times as the kites still got destroyed. Thankfully I could craft other toys with their sticks and strings.
Ironically, i feel that's still the life i live.`,
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-02T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:4`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '4',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '4',
    tokenType: 'ERC721',
    name: 'I Had Dreams About You',
    description: 'I wish I could remember exactly.',
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
      thumbnailUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
      pngUrl: '/new_series/4_I_Had_Dreams_About_You.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/4_I_Had_Dreams_About_You.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/4_I_Had_Dreams_About_You.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: 'I Had Dreams About You',
        description: 'I wish I could remember exactly.',
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-05T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:5`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '5',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/5_Mapping_the_Unseen.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '5',
    tokenType: 'ERC721',
    name: 'Mapping the Unseen',
    description: `To find an answer... The work had an interesting process. It is worth watching, as I certainly shared it somewhere. The process is unseen, the final is mysterious, but the process is in flow with mind and subconscious. I had some trouble finishing the collection in the middle of the process. I was not giving proper attention to my other side and was too focused on the conscious world. I let go of the mind, the free time to watch and think deep... that is important.`,
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/5_Mapping_the_Unseen.jpg',
      thumbnailUrl: '/new_series/5_Mapping_the_Unseen.jpg',
      pngUrl: '/new_series/5_Mapping_the_Unseen.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/5_Mapping_the_Unseen.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/5_Mapping_the_Unseen.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: 'Mapping the Unseen',
        description: `To find an answer... The work had an interesting process. It is worth watching, as I certainly shared it somewhere. The process is unseen, the final is mysterious, but the process is in flow with mind and subconscious. I had some trouble finishing the collection in the middle of the process. I was not giving proper attention to my other side and was too focused on the conscious world. I let go of the mind, the free time to watch and think deep... that is important.`,
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-07T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:6`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '6',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/6_Playing_Chess_with_Love.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '6',
    tokenType: 'ERC721',
    name: 'Playing Chess with Love',
    description: `I held my heart like a king behind pawns, hoping the game would not end in loss.`,
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/6_Playing_Chess_with_Love.jpg',
      thumbnailUrl: '/new_series/6_Playing_Chess_with_Love.jpg',
      pngUrl: '/new_series/6_Playing_Chess_with_Love.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/6_Playing_Chess_with_Love.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/6_Playing_Chess_with_Love.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: 'Playing Chess with Love',
        description: `I held my heart like a king behind pawns, hoping the game would not end in loss.`,
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-09T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:7`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '7',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/7_All_Time_High_Discovery.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '7',
    tokenType: 'ERC721',
    name: 'All Time High Discovery',
    description: `Ideas, feelings, memories looping over themselves like waves. A homage to "All Time High in the City" artwork by the legend X-Copy, 2018.`,
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/7_All_Time_High_Discovery.jpg',
      thumbnailUrl: '/new_series/7_All_Time_High_Discovery.jpg',
      pngUrl: '/new_series/7_All_Time_High_Discovery.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/7_All_Time_High_Discovery.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/7_All_Time_High_Discovery.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: 'All Time High Discovery',
        description: `Ideas, feelings, memories looping over themselves like waves. A homage to "All Time High in the City" artwork by the legend X-Copy, 2018.`,
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-12T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:8`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '8',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/8_I_Am_Where_You_Arent.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '8',
    tokenType: 'ERC721',
    name: `I Am Where You Aren’t`,
    description: `Desire. The collector can choose on-chain between two sides of the same work. I worked on both positions in this piece.`,
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/8_I_Am_Where_You_Arent.jpg',
      thumbnailUrl: '/new_series/8_I_Am_Where_You_Arent.jpg',
      pngUrl: '/new_series/8_I_Am_Where_You_Arent.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/8_I_Am_Where_You_Arent.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/8_I_Am_Where_You_Arent.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: `I Am Where You Aren’t`,
        description: `Desire. The collector can choose on-chain between two sides of the same work. I worked on both positions in this piece.`,
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-14T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:9`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '9',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/9_Before_Birth.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '9',
    tokenType: 'ERC721',
    name: `Before Birth`,
    description: `Something waiting in quiet.`,
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/9_Before_Birth.jpg',
      thumbnailUrl: '/new_series/9_Before_Birth.jpg',
      pngUrl: '/new_series/9_Before_Birth.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/9_Before_Birth.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/9_Before_Birth.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: `Before Birth`,
        description: `Something waiting in quiet.`,
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-16T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  },
  {
    nft_id: `${STORIES_ON_CIRCLES_COLLECTION_ADDRESS}:10`,
    chain: 'ethereum',
    contract: {
      address: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      name: 'Stories on Circles',
      symbol: 'SOC',
      totalSupply: '10',
      tokenType: 'ERC721',
      contractDeployer: STORIES_ON_CIRCLES_COLLECTION_ADDRESS,
      deployedBlockNumber: 1,
      openSeaMetadata: {
        floorPrice: 0,
        collectionName: 'Stories on Circles',
        collectionSlug: STORIES_ON_CIRCLES_SLUG,
        safelistRequestStatus: 'verified',
        imageUrl: '/new_series/10_He_Left_as_a_Dot.jpg',
        description: 'Stories on Circles Collection',
        externalUrl: null,
        twitterUsername: '',
        discordUrl: '',
        bannerImageUrl: '',
        lastIngestedAt: new Date().toISOString()
      },
      isSpam: false,
      spamClassifications: []
    },
    tokenId: '10',
    tokenType: 'ERC721',
    name: `He Left as a Dot`,
    description: `Art, to me, is a mirror. You see through your memories, your longings, your shape. Despite sharing mine, and this series of artworks being a creation by myself, I have more fun hearing about what you think, what you see, what kind of emotion the work makes you feel... It is human. It gets us together, to know we are not alone in the wild and bittersweet journey of life. Not everyone will have a moment with these works, but if you allow yourself a moment, you might notice something unexpected: maybe not in the work, but in you. This is the last artwork in the collection. It doesn’t ask to be understood, but to be felt.`,
    tokenUri: '',
    image: {
      cachedUrl: '/new_series/10_He_Left_as_a_Dot.jpg',
      thumbnailUrl: '/new_series/10_He_Left_as_a_Dot.jpg',
      pngUrl: '/new_series/10_He_Left_as_a_Dot.jpg',
      contentType: 'image/jpeg',
      size: 0,
      originalUrl: '/new_series/10_He_Left_as_a_Dot.jpg'
    },
    raw: {
      tokenUri: '',
      metadata: {
        image: '/new_series/10_He_Left_as_a_Dot.jpg',
        createdBy: '',
        yearCreated: '2024',
        name: `He Left as a Dot`,
        description: `Art, to me, is a mirror. You see through your memories, your longings, your shape. Despite sharing mine, and this series of artworks being a creation by myself, I have more fun hearing about what you think, what you see, what kind of emotion the work makes you feel... It is human. It gets us together, to know we are not alone in the wild and bittersweet journey of life. Not everyone will have a moment with these works, but if you allow yourself a moment, you might notice something unexpected: maybe not in the work, but in you. This is the last artwork in the collection. It doesn’t ask to be understood, but to be felt.`,
        media: null,
        tags: []
      },
      error: null
    },
    collection: {
      name: 'Stories on Circles',
      slug: STORIES_ON_CIRCLES_SLUG,
      externalUrl: null,
      bannerImageUrl: ''
    },
    mint: {
      mintAddress: null,
      blockNumber: null,
      timestamp: '2025-05-19T12:00:00.000Z',
      transactionHash: null
    },
    owners: null,
    timeLastUpdated: new Date().toISOString()
  }
]

export const ALL_NFTS = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/nfts.json`
    )
    const data = await response.json()
    return data.nfts
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return ['0xfda33af4770d844dc18d8788c7bf84accfac79ad:14']
  }
}

export const MANIFOLD_NFTS = [
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad',
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50',
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c',
  '0xe70659b717112ac4e14284d0db2f5d5703df8e43'
]
export const TRANSIENT_NFTS = ['0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43']
export const SUPERRARE_NFTS = ['0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0']
export const POAP_NFTS = ['0x22c1f6050e56d2876009903609a2cc3fef83b415']
export const GRAILS_NFTS = ['0x92a50fe6ede411bd26e171b97472e24d245349b8']
export const RARIBLE_NFTS = ['0x60f80121c31a0d46b5279700f9df786054aa5ee5']
export const OPEN_SEA_NFTS = ['0x495f947276749ce646f68ac8c248420045cb7b5e']

export const OVERRIDE_EXTERNAL_LINKS: Record<
  string,
  { name: string; link: string }
> = {
  '0xe70659b717112ac4e14284d0db2f5d5703df8e43:343': {
    name: 'pepe.wtf',
    link: 'https://pepe.wtf/asset/omentepepe'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:14': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/we-always-find-a-way/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:15': {
    name: 'SuperRare',
    link: 'https://superrare.com/artwork/eth/0xfdA33af4770D844DC18D8788C7Bf84accfac79aD/15'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:13': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/my-desires/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:12': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/between-the-sun-and-moon/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:11': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/ups-and-downs/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:11': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/11'
  },
  '0x92a50fe6ede411bd26e171b97472e24d245349b8': {
    name: 'Grails',
    link: 'https://www.proof.xyz/grails/season-5/a-black-dot-with-a-white-dot-on-a-green-background'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:10': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/10'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:8': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/cheap-problems/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:9': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/9'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:6': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/6-dots/'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:5': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/musician-at-ipanemas-beach/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:8': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/8'
  },
  '0xfda33af4770d844dc18d8788c7bf84accfac79ad:4': {
    name: 'AOTM',
    link: 'https://aotm.gallery/artwork/the-search/'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:7': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/7'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:10': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/10'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:9': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/9'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:8': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/8'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:7': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/7'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:6': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/6'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:5': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/5'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:4': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/4'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:3': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/3'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:2': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/2'
  },
  '0x2b3bbde45422d65ab3fb5cdc5427944db0729b50:1': {
    name: 'Foundation',
    link: 'https://foundation.app/mint/eth/0x2b3bBde45422D65AB3fb5cDC5427944dB0729B50/1'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:5': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/5'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:4': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/4'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:3': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/3'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:2': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/2'
  },
  '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:1': {
    name: 'OpenSea',
    link: 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/1'
  },
  '0x60f80121c31a0d46b5279700f9df786054aa5ee5:19434': {
    name: 'Rarible',
    link: 'https://rarible.com/token/0x60f80121c31a0d46b5279700f9df786054aa5ee5:19434'
  }
}
