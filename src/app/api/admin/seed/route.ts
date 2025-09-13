import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/seed - Manual database seeding endpoint
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Manual database seeding started...')

    // Use require for CommonJS module
    const { seedOnDeploy } = require('../../../../../scripts/utils/vercel-seed')
    await seedOnDeploy()

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully'
    })
  } catch (error) {
    console.error('Manual seed error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Seeding failed', details: errorMessage },
      { status: 500 }
    )
  }
}
