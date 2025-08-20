import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Check for authentication token in localStorage (this is a simple check)
    // In a real app, you'd validate a JWT token or session
    const response = NextResponse.next()

    // Add headers to help with client-side auth check
    response.headers.set("x-pathname", request.nextUrl.pathname)

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
