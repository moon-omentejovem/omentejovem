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

    // Get the current file content
    const currentContentResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/public/mint-dates.json`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!currentContentResponse.ok) {
      throw new Error('Failed to fetch current file content')
    }

    const { content, sha } = await currentContentResponse.json()
    const currentContent = JSON.parse(Buffer.from(content, 'base64').toString())

    // Filter out the entry to delete
    const updatedContent = currentContent.filter((item: any) => 
      !(item && 
        item.contractAddress?.toLowerCase() === contractAddress.toLowerCase() && 
        item.tokenId === tokenId)
    )

    // Update the file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/public/mint-dates.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Delete entry from mint-dates.json',
          content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString('base64'),
          sha,
          branch: GITHUB_BRANCH
        })
      }
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to update file')
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