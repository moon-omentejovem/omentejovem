import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()

  await supabase.auth.signOut()

  return NextResponse.redirect(`${requestUrl.origin}/admin`, {
    status: 301
  })
}
