// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimit } from 'express-rate-limit';

// --- Rate Limiter Configuration ---
// For production, use a persistent store like Redis.
// This in-memory store will reset on server restarts.
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: 'draft-7', // Enable standard rate limit headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: 'Too Many Requests. Please try again later.', // Message to show if limit is exceeded
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting to login attempts
  // Target specific routes that handle authentication. Adjust if your login flow differs.
  // Common targets include /login page submission or NextAuth.js callback routes.
  const isLoginOrAuthCallback = pathname === '/login' || pathname.startsWith('/api/auth/callback');

  if (isLoginOrAuthCallback) {
    try {
      // Use the 'handle' method for Next.js middleware compatibility
      const response = await limiter.handle(request);

      // If `response.ok` is false, it means the rate limit was exceeded.
      if (!response.ok) {
        // Return the 429 error response
        return response;
      }
    } catch (e) {
      // If rate limiting fails (e.g., store error), log it but allow the request to proceed
      // to avoid blocking users due to infrastructure issues.
      console.error('Rate limiting failed:', e);
    }
  }

  // Continue processing other routes
  return NextResponse.next();
}

/*
   Installation Instructions:
   1. Install the necessary package:
      npm install express-rate-limit
      # or
      yarn add express-rate-limit

   2. For production environments, it is highly recommended to use a persistent store
      like Redis instead of the default in-memory store. This would involve setting up
      a Redis client and using a Redis store adapter for express-rate-limit.
      Example using Redis:
      import { Redis } from 'ioredis'; // Or your preferred Redis client
      import { RedisStore } from 'rate-limit-redis';
      const redisClient = new Redis(process.env.REDIS_URL);

      const limiter = new RateLimit({
        store: new RedisStore(redisClient), // Using Redis store
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 10, // Limit each IP to 10 requests per windowMs
        standardHeaders: 'draft-7',
        legacyHeaders: false,
      });
*/
