import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { limit, checkoutLimit, aiLimit } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/contact')) {
    const { success } = await limit(`rl_auth_${pathname}_${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith('/api/checkout') || pathname.startsWith('/api/payments')) {
    const { success } = await checkoutLimit(`rl_checkout_${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith('/api/ai') || pathname.startsWith('/api/ai-wallpaper')) {
    const { success } = await aiLimit(`rl_ai_${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith('/api/installations') || pathname.startsWith('/api/estimator')) {
    const { success } = await checkoutLimit(`rl_install_${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.isAdmin) {
      console.warn(`Intento de acceso no autorizado a ${pathname} desde ${request.ip}`);

      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*',
    '/api/contact/:path*',
    '/api/checkout/:path*',
    '/api/payments/:path*',
    '/api/ai/:path*',
    '/api/ai-wallpaper/:path*',
    '/api/installations/:path*',
    '/api/estimator/:path*',
  ],
};
