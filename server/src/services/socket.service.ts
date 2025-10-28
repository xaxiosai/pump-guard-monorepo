import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { cacheService } from "./cache.service";

class SocketService {
  private io: Server | null = null;

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", async (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      const tokensScanned = await cacheService.getTokensScanned();
      socket.emit("tokensScanned", tokensScanned);

      const lastScannedTokens = await cacheService.getLastScannedTokens();
      socket.emit("lastScannedTokens", lastScannedTokens);

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  async emitTokenScanned(
    tokenAddress: string,
    tokensScanned: number,
    tokenInfo: {
      name: string;
      symbol: string;
      image: string | null;
      marketCap: number;
      score: number;
      timestamp: number;
    }
  ) {
    if (this.io) {
      this.io.emit("tokenScanned", {
        tokenAddress,
        tokensScanned,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        image: tokenInfo.image,
        marketCap: tokenInfo.marketCap,
        score: tokenInfo.score,
        timestamp: tokenInfo.timestamp,
      });
    }
  }

  getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();
