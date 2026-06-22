import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'xevietnam2024'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const auth = request.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
      const [user, pass] = decoded.split(':')
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="XeVietnam Admin", charset="UTF-8"',
    },
  })
}

export const config = {
  matcher: '/admin/:path*',
}
