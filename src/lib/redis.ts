import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.KV_URL) return process.env.KV_URL;
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  return 'redis://localhost:6379';
};

// Singleton pattern for Redis client to avoid multiple connections in dev
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(getRedisUrl(), {
    // Add retries or other config if needed
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
