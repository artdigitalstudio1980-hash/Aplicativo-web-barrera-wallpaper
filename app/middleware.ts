// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Import getToken
import { Ratelimit } from '@upstash/ratelimit'; // Import Ratelimit
import { Redis } from '@upstash/redis'; // Import Redis

// Initialize Upstash Redis client
// IMPORTANT: Ensure UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN are set in environment variables.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Create two rate limiters:
// 1. For unauthenticated requests (based on IP) - Global API limit
const ipRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '10 s'), // 100 requests per 10 seconds per IP
  analytics: true,
});

// 2. For authenticated requests (based on user ID) - Global API limit
const userRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(200, '1 minute'), // 200 requests per minute per user
  analytics: true,
});

// 3. Specific rate limiter for the registration endpoint
const registerRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 hour'), // 5 registration attempts per hour per IP
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'; // Fallback IP
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    // Specific rate limiting for registration endpoint
    if (pathname === '/api/auth/register') {
      const { success } = await registerRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ message: 'Too Many Registration Attempts. Please try again later.' }, { status: 429 });
      }
    }

    const session = await getToken({ req: request }); // Get user session from JWT

    if (session?.user?.id) {
      // Authenticated user - apply global API limit
      const { success } = await userRatelimit.limit(session.user.id);
      if (!success) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
    } else {
      // Unauthenticated user - apply global API limit
      const { success } = await ipRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
    }
  }

  // Continue processing other routes
  return NextResponse.next();
}

export const config = {
  // Match all routes including API routes.
  matcher: [
    '/api/:path*', // Apply middleware to all API routes
    '/((?!_next/static|_next/image|favicon.ico).*)', // Also apply to other non-api routes
  ],
};
