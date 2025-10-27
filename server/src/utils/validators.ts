import { z } from "zod";
import { PublicKey } from "@solana/web3.js";

export const scanTokenParamsSchema = z.object({
  tokenAddress: z.string().refine(
    (address) => {
      try {
        new PublicKey(address);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid Solana token address" }
  ),
});
