import { fetchTransfersForToken } from '@/lib/legacy-api'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  {
    params
  }: { params: { chain: string; contractAddress: string; tokenId: string } }
) {
  try {
    const { chain, contractAddress, tokenId } = params

    const transfers = await fetchTransfersForToken(
      chain,
      contractAddress,
      tokenId
    )

    return NextResponse.json(transfers)
  } catch (error) {
    console.error('Error fetching transfers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transfers' },
      { status: 500 }
    )
  }
}
