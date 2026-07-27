import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

let ratelimit: Ratelimit | null = null;
let checkoutLimiter: Ratelimit | null = null;
let aiLimiter: Ratelimit | null = null;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

function makeLimiter(redis: Redis, limit: number, window: string) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
  });
}

function allowAll(): { success: true; limit: number; remaining: number; reset: number } {
  return { success: true, limit: 999, remaining: 999, reset: 0 };
}

const configured = () => !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export const limit = async (identifier: string) => {
  if (!configured()) return allowAll();
  if (!ratelimit) {
    const redis = getRedis();
    if (!redis) return allowAll();
    ratelimit = makeLimiter(redis, 5, "60 s");
  }
  return ratelimit.limit(identifier);
};

export const checkoutLimit = async (identifier: string) => {
  if (!configured()) return allowAll();
  if (!checkoutLimiter) {
    const redis = getRedis();
    if (!redis) return allowAll();
    checkoutLimiter = makeLimiter(redis, 10, "60 s");
  }
  return checkoutLimiter.limit(identifier);
};

export const aiLimit = async (identifier: string) => {
  if (!configured()) return allowAll();
  if (!aiLimiter) {
    const redis = getRedis();
    if (!redis) return allowAll();
    aiLimiter = makeLimiter(redis, 5, "60 s");
  }
  return aiLimiter.limit(identifier);
};
