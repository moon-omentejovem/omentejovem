import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export async function POST(request: Request) {
  try {
    // Check authentication
    const adminAuth = cookies().get('admin-auth')
    if (!adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractAddress, tokenId } = await request.json()

    if (!contractAddress || !tokenId) {
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

    // Filter out the entry to delete from mint-dates.json
    const updatedMintDates = currentMintDates.filter(
      (item: any) =>
        !(
          item &&
          item.contractAddress?.toLowerCase() ===
            contractAddress.toLowerCase() &&
          item.tokenId === tokenId
        )
    )

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

    // Remove the NFT from nfts.json
    const nftId = `${contractAddress}:${tokenId}`
    const updatedNfts = {
      ...currentNfts,
      nfts: currentNfts.nfts.filter((id: string) => id !== nftId)
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
          message: 'Delete entry from mint-dates.json',
          content: Buffer.from(
            JSON.stringify(updatedMintDates, null, 2)
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
          message: 'Delete entry from nfts.json',
          content: Buffer.from(JSON.stringify(updatedNfts, null, 2)).toString(
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
    console.error('Error deleting mint date:', error)
    return NextResponse.json(
      { error: 'Failed to delete mint date' },
      { status: 500 }
    )
  }
}
