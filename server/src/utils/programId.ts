import { Connection, PublicKey } from "@solana/web3.js";

export const PROGRAM_IDS = {
  TOKEN_PROGRAM: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  TOKEN_2022_PROGRAM: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  ASSOCIATED_TOKEN_PROGRAM: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
} as const;

export type ProgramType = keyof typeof PROGRAM_IDS;

export const detectProgramId = async (
  connection: Connection,
  mintAddress: string | PublicKey
): Promise<PublicKey> => {
  try {
    const mintPubkey = typeof mintAddress === "string" ? new PublicKey(mintAddress) : mintAddress;
    const accountInfo = await connection.getAccountInfo(mintPubkey);

    if (!accountInfo) {
      throw new Error("Token mint account not found");
    }

    const TOKEN_PROGRAM_ID = new PublicKey(PROGRAM_IDS.TOKEN_PROGRAM);
    const TOKEN_2022_PROGRAM_ID = new PublicKey(PROGRAM_IDS.TOKEN_2022_PROGRAM);

    if (accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
      return TOKEN_2022_PROGRAM_ID;
    }

    if (accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      return TOKEN_PROGRAM_ID;
    }

    throw new Error(`Unknown token program: ${accountInfo.owner.toBase58()}`);
  } catch (error) {
    console.error("Error detecting program ID:", error);
    return new PublicKey(PROGRAM_IDS.TOKEN_PROGRAM);
  }
};

export const getTokenProgramId = (): PublicKey => {
  return new PublicKey(PROGRAM_IDS.TOKEN_PROGRAM);
};

export const getToken2022ProgramId = (): PublicKey => {
  return new PublicKey(PROGRAM_IDS.TOKEN_2022_PROGRAM);
};

export const getAssociatedTokenProgramId = (): PublicKey => {
  return new PublicKey(PROGRAM_IDS.ASSOCIATED_TOKEN_PROGRAM);
};
