import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Basic middleware that allows all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/history/:path*",
    "/settings/:path*",
  ],
}
