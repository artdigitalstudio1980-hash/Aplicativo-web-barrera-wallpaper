import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazy initialization to avoid build-time errors when env vars are missing
let ratelimit: Ratelimit | null = null;

export const getRatelimit = () => {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("⚠️ Upstash Redis credentials missing. Ratelimiting is disabled.");
    return null;
  }

  try {
    const redis = new Redis({
      url,
      token,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
    });

    return ratelimit;
  } catch (error) {
    console.error("Failed to initialize Ratelimit:", error);
    return null;
  }
};

// Export a mock or the real one for easy usage
export const limit = async (identifier: string) => {
  const rl = getRatelimit();
  if (!rl) return { success: true, limit: 0, remaining: 0, reset: 0 }; // Default to success if not configured
  return rl.limit(identifier);
};
