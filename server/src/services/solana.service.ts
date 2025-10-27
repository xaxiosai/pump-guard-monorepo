import { Connection } from "@solana/web3.js";
import { env } from "~/config/env";

export const solana = new Connection(env.RPC_URL, {
  commitment: "confirmed",
});