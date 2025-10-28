import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { cacheService } from "./cache.service";

class SocketService {
  private io: Server | null = null;

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", async (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      const tokensScanned = await cacheService.getTokensScanned();
      socket.emit("tokensScanned", tokensScanned);

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  async emitTokenScanned(tokenAddress: string, tokensScanned: number) {
    if (this.io) {
      this.io.emit("tokenScanned", { tokenAddress, tokensScanned });
    }
  }

  getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();
