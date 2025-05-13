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

    console.log('hi', GITHUB_REPO, GITHUB_BRANCH)

    // Get the current file content
    const currentContentResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/client/public/mint-dates.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )

    console.log('currentContentResponse', currentContentResponse)

    if (!currentContentResponse.ok) {
      throw new Error('Failed to fetch current file content')
    }

    const { content, sha } = await currentContentResponse.json()
    const currentContent = JSON.parse(Buffer.from(content, 'base64').toString())

    // Add the new entry
    currentContent.push(newEntry)

    // Update the file
    const updateResponse = await fetch(
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
            JSON.stringify(currentContent, null, 2)
          ).toString('base64'),
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
    console.error('Error updating mint dates:', error)
    return NextResponse.json(
      { error: 'Failed to update mint dates' },
      { status: 500 }
    )
  }
}
