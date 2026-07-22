import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

export const limit = async (identifier: string) => {
  if (!ratelimit) {
    const redis = getRedis();
    if (!redis) {
      console.error("❌ Rate limiting unconfigured. Blocking request for safety.");
      return { success: false, limit: 0, remaining: 0, reset: 0 };
    }
    ratelimit = makeLimiter(redis, 5, "60 s");
  }
  return ratelimit.limit(identifier);
};

export const checkoutLimit = async (identifier: string) => {
  if (!checkoutLimiter) {
    const redis = getRedis();
    if (!redis) {
      return { success: false, limit: 0, remaining: 0, reset: 0 };
    }
    checkoutLimiter = makeLimiter(redis, 10, "60 s");
  }
  return checkoutLimiter.limit(identifier);
};

export const aiLimit = async (identifier: string) => {
  if (!aiLimiter) {
    const redis = getRedis();
    if (!redis) {
      return { success: false, limit: 0, remaining: 0, reset: 0 };
    }
    aiLimiter = makeLimiter(redis, 5, "60 s");
  }
  return aiLimiter.limit(identifier);
};
