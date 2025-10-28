import Redis from "ioredis";
import { env } from "~/config/env";

class CacheService {
  private client: Redis;

  constructor() {
    this.client = new Redis(env.REDIS_URL);

    this.client.on("error", (error) => {
      console.error("Redis connection error:", error);
    });

    this.client.on("connect", () => {
      console.log("Redis connected successfully");
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  async incrementTokensScanned(): Promise<number> {
    try {
      return await this.client.incr("tokens:scanned:total");
    } catch (error) {
      console.error("Error incrementing tokens scanned:", error);
      return 0;
    }
  }

  async getTokensScanned(): Promise<number> {
    try {
      const count = await this.client.get("tokens:scanned:total");
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error("Error getting tokens scanned:", error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();
