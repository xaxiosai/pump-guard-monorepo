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

  async addLastScannedToken(tokenData: {
    tokenAddress: string;
    name: string;
    symbol: string;
    image: string | null;
    marketCap: number;
    score: number;
    timestamp: number;
  }): Promise<void> {
    try {
      const tokenKey = "tokens:last-scanned:24h";
      const dataKey = `tokens:last-scanned:data:${tokenData.tokenAddress}`;

      await this.client.zadd(tokenKey, tokenData.timestamp, tokenData.tokenAddress);

      await this.client.setex(dataKey, 86400, JSON.stringify(tokenData));

      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      await this.client.zremrangebyscore(tokenKey, 0, oneDayAgo);

      await this.client.expire(tokenKey, 86400);
    } catch (error) {
      console.error("Error adding last scanned token:", error);
    }
  }

  async getLastScannedTokens(): Promise<
    Array<{
      tokenAddress: string;
      name: string;
      symbol: string;
      image: string | null;
      marketCap: number;
      score: number;
      timestamp: number;
    }>
  > {
    try {
      const tokenKey = "tokens:last-scanned:24h";

      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      await this.client.zremrangebyscore(tokenKey, 0, oneDayAgo);

      const tokenAddresses = await this.client.zrevrange(tokenKey, 0, 49);

      const tokens: Array<{
        tokenAddress: string;
        name: string;
        symbol: string;
        image: string | null;
        marketCap: number;
        score: number;
        timestamp: number;
      }> = [];

      for (const address of tokenAddresses) {
        const dataKey = `tokens:last-scanned:data:${address}`;
        const tokenData = await this.client.get(dataKey);
        if (tokenData) {
          tokens.push(JSON.parse(tokenData));
        }
      }

      return tokens;
    } catch (error) {
      console.error("Error getting last scanned tokens:", error);
      return [];
    }
  }
}

export const cacheService = new CacheService();
