import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  getMetadataPointerState,
  getTokenMetadata,
  unpackAccount,
} from "@solana/spl-token";
import axios from "axios";
import { solana } from "./solana.service";

interface TokenMetadata {
  name: string;
  symbol: string;
  image?: string;
  description?: string;
}

export class MetadataService {
  private static instance: MetadataService;
  private umi;

  private constructor() {
    const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
    this.umi = createUmi(rpcUrl);
  }

  public static getInstance(): MetadataService {
    if (!MetadataService.instance) {
      MetadataService.instance = new MetadataService();
    }
    return MetadataService.instance;
  }

  async getTokenMetadata(tokenAddress: string, programId?: PublicKey): Promise<TokenMetadata | null> {
    try {
      const mintPubkey = new PublicKey(tokenAddress);

      if (!programId) {
        const accountInfo = await solana.getAccountInfo(mintPubkey);
        if (!accountInfo) {
          return null;
        }
        programId = accountInfo.owner;
      }

      if (programId.equals(TOKEN_2022_PROGRAM_ID)) {
        return await this.getToken2022Metadata(mintPubkey);
      } else {
        return await this.getMetaplexMetadata(tokenAddress);
      }
    } catch (error) {
      console.error("Error fetching token metadata:", error);
      return null;
    }
  }

  private async getMetaplexMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
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

  private async getToken2022Metadata(mintPubkey: PublicKey): Promise<TokenMetadata | null> {
    try {
      const metadata = await getTokenMetadata(
        solana,
        mintPubkey,
        "confirmed",
        TOKEN_2022_PROGRAM_ID
      );

      if (!metadata) {
        return null;
      }

      const name = metadata.name || "";
      const symbol = metadata.symbol || "";
      const metadataUri = metadata.uri || null;

      if (metadataUri) {
        try {
          const metadataResponse = await axios.get(metadataUri, {
            timeout: 5000,
            headers: {
              "User-Agent": "PumpGuard/1.0",
            },
          });

          const jsonMetadata = metadataResponse.data;

          return {
            name: jsonMetadata.name || name,
            symbol: jsonMetadata.symbol || symbol,
            image: jsonMetadata.image || undefined,
            description: jsonMetadata.description || undefined,
          };
        } catch (error) {
          return {
            name,
            symbol,
            image: undefined,
            description: undefined,
          };
        }
      }

      return {
        name,
        symbol,
        image: undefined,
        description: undefined,
      };
    } catch (error) {
      console.error("Error fetching Token-2022 metadata:", error);
      return null;
    }
  }

  async getTokenImage(tokenAddress: string, programId?: PublicKey): Promise<string | null> {
    const metadata = await this.getTokenMetadata(tokenAddress, programId);
    return metadata?.image || null;
  }
}
