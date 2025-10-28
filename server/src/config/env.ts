import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  REDIS_URL: z.string().default("redis://localhost:6379"),
  RPC_URL: z.string(),

  DEXSCREENER_API_URL: z.string().default("https://api.dexscreener.com"),

  RATE_LIMIT_WINDOW: z.string().default("15"),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),

  CACHE_TTL_RISK_SCORE: z.string().default("15"),
  CACHE_TTL_WALLETS_CREATION: z.string().default("86400"),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => e.path.join(".")).join(", ");
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

export const env = parseEnv();