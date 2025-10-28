import { Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import moment from "moment-timezone";
import { sendSuccess, sendError } from "~/utils/response";
import { dexscreenerService, ALLOWED_DEX_IDS } from "~/services/dexscreener.service";
import { solana } from "~/services/solana.service";
import { analyzeToken } from "~/services/risk.service";
import { cacheService } from "~/services/cache.service";
import { env } from "~/config/env";
import { MetadataService } from "~/services/metadata.service";
import { socketService } from "~/services/socket.service";

export const scanToken = async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;

    const cacheKey = `token:scan:${tokenAddress}`;
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      return sendSuccess(res, "Token scan completed (cached)", cachedData);
    }

    const tokenData = await dexscreenerService.getTokenData("solana", tokenAddress);

    if (!tokenData) {
      return sendError(res, "Token not found", 404);
    }

    if (tokenData.chainId !== "solana" || !ALLOWED_DEX_IDS.includes(tokenData.dexId)) {
      return sendError(res, "Only Pumpfun and Pumpswap tokens on Solana are supported", 400);
    }

    const tokenMint = new PublicKey(tokenAddress);

    const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

    const tokenAccounts = await solana.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [
        { dataSize: 165 },
        {
          memcmp: {
            offset: 0,
            bytes: tokenMint.toBase58(),
          },
        },
      ],
    });

    const accountsWithBalances = tokenAccounts
      .map((account) => {
        const data = account.account.data;
        const amount = data.readBigUInt64LE(64);
        const owner = new PublicKey(data.slice(32, 64));

        return {
          owner,
          amount: Number(amount),
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 50);

    const holderDataPromises = accountsWithBalances.map(async (account) => {
      const tokenAmount = account.amount / Math.pow(10, 9);

      try {
        const balance = await solana.getBalance(account.owner);
        const balanceSOL = balance / Math.pow(10, 9);

        return {
          address: account.owner.toBase58(),
          balance: balanceSOL,
          tokenAmount,
        };
      } catch (error) {
        console.error(`Error fetching balance for ${account.owner.toBase58()}:`, error);
        return {
          address: account.owner.toBase58(),
          balance: 0,
          tokenAmount,
        };
      }
    });

    const holders = await Promise.all(holderDataPromises);
    const riskAnalysis = await analyzeToken(tokenAddress, holders);

    // Fetch token image from metadata (IPFS)
    const metadataService = new MetadataService();
    const tokenImage = await metadataService.getTokenImage(tokenAddress);

    const responseData = {
      tokenAddress,
      tokenInfo: {
        name: tokenData.baseToken.name,
        symbol: tokenData.baseToken.symbol,
        image: tokenImage,
        pairAddress: tokenData.pairAddress,
        priceUsd: tokenData.priceUsd,
        marketCap: tokenData.marketCap,
        pairCreatedAt: Math.floor(tokenData.pairCreatedAt / 1000),
      },
      metrics: riskAnalysis.metrics,
      overallScore: riskAnalysis.overallScore,
      riskLevel: riskAnalysis.riskLevel,
      scannedAt: moment.utc().unix(),
    };

    const cacheTTL = parseInt(env.CACHE_TTL_RISK_SCORE);
    await cacheService.set(cacheKey, responseData, cacheTTL);

    const tokensScanned = await cacheService.incrementTokensScanned();
    await socketService.emitTokenScanned(tokenAddress, tokensScanned);

    return sendSuccess(res, "Token scan completed", responseData);
  } catch (error) {
    console.error("Scan error:", error);
    return sendError(res, "Internal server error", 500);
  }
};
