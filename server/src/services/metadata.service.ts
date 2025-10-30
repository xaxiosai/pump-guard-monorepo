import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import axios from "axios";

interface TokenMetadata {
  name: string;
  symbol: string;
  image?: string;
  description?: string;
}

export class MetadataService {
  private umi;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    this.umi = createUmi(rpcUrl);
  }

  async getTokenMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
    try {
      const mint = publicKey(tokenAddress);
      const asset = await fetchDigitalAsset(this.umi, mint);

      if (!asset.metadata.uri) {
        return null;
      }

      const metadataResponse = await axios.get(asset.metadata.uri, {
        timeout: 5000,
        headers: {
          "User-Agent": "PumpGuard/1.0",
        },
      });

      const metadata = metadataResponse.data;

      return {
        name: metadata.name || "",
        symbol: metadata.symbol || "",
        image: metadata.image || undefined,
        description: metadata.description || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async getTokenImage(tokenAddress: string): Promise<string | null> {
    const metadata = await this.getTokenMetadata(tokenAddress);
    return metadata?.image || null;
  }
}
