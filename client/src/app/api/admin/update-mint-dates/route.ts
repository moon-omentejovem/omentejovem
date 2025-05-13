import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// These should be environment variables in production
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO // format: "username/repo"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export async function POST(request: Request) {
  try {
    // Check authentication
    const adminAuth = cookies().get('admin-auth')
    if (!adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newEntry = await request.json()

    // Validate the new entry
    if (!newEntry.contractAddress || !newEntry.tokenId || !newEntry.mintDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the current mint-dates.json content
    const currentMintDatesResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/client/public/mint-dates.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )

    if (!currentMintDatesResponse.ok) {
      throw new Error('Failed to fetch current mint-dates.json content')
    }

    const { content: mintDatesContent, sha: mintDatesSha } =
      await currentMintDatesResponse.json()
    const currentMintDates = JSON.parse(
      Buffer.from(mintDatesContent, 'base64').toString()
    )

    // Add the new entry to mint-dates.json
    currentMintDates.push(newEntry)

    // Get the current nfts.json content
    const currentNftsResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/client/public/nfts.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )

    if (!currentNftsResponse.ok) {
      throw new Error('Failed to fetch current nfts.json content')
    }

    const { content: nftsContent, sha: nftsSha } =
      await currentNftsResponse.json()
    const currentNfts = JSON.parse(
      Buffer.from(nftsContent, 'base64').toString()
    )

    // Add the new NFT to nfts.json if it doesn't exist
    const newNftId = `${newEntry.contractAddress}:${newEntry.tokenId}`
    if (!currentNfts.nfts.includes(newNftId)) {
      currentNfts.nfts.push(newNftId)
    }

    // Update mint-dates.json
    const updateMintDatesResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/client/public/mint-dates.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update mint-dates.json',
          content: Buffer.from(
            JSON.stringify(currentMintDates, null, 2)
          ).toString('base64'),
          sha: mintDatesSha,
          branch: GITHUB_BRANCH
        })
      }
    )

    if (!updateMintDatesResponse.ok) {
      throw new Error('Failed to update mint-dates.json')
    }

    // Update nfts.json
    const updateNftsResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/client/public/nfts.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update nfts.json',
          content: Buffer.from(JSON.stringify(currentNfts, null, 2)).toString(
            'base64'
          ),
          sha: nftsSha,
          branch: GITHUB_BRANCH
        })
      }
    )

    if (!updateNftsResponse.ok) {
      throw new Error('Failed to update nfts.json')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating mint dates:', error)
    return NextResponse.json(
      { error: 'Failed to update mint dates' },
      { status: 500 }
    )
  }
}
