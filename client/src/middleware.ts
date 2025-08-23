import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for the admin dashboard
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const adminAuth = request.cookies.get('admin-auth')

    // If no auth cookie is present, redirect to the admin login page
    if (!adminAuth) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/dashboard/:path*'
}
