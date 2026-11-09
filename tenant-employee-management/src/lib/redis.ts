import "server-only";
import Redis from "ioredis";

const url = process.env.REDIS_URL;
if (!url) throw new Error("REDIS_URL is required");

export const redis = new Redis(url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy: (attempt) => Math.min(attempt * 250, 3000)
});

redis.on("error", (error) => {
  // Do not log credentials or connection URLs.
  console.error("Redis connection error", error.message);
});
