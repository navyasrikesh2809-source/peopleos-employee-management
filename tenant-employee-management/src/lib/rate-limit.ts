import "server-only";
import { redis } from "@/lib/redis";

export async function enforceRateLimit(
  key: string,
  limit = 10,
  windowSeconds = 60
): Promise<void> {
  const redisKey = `rate:${key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) await redis.expire(redisKey, windowSeconds);
  if (count > limit) {
    const error = new Error("Too many requests");
    error.name = "RateLimitError";
    throw error;
  }
}
