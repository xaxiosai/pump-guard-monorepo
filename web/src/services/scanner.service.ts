import { axiosInstance } from "~/utils/axiosInstance";
import type { ApiResponse, TokenScanResult } from "~/types/api";

class ScannerService {
  async scanToken(tokenAddress: string): Promise<TokenScanResult> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<TokenScanResult>>(
        `/scanner/scan/${tokenAddress}`
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to scan token");
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while scanning token");
    }
  }
}

export const scannerService = new ScannerService();
