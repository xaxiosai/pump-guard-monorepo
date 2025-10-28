import { io, Socket } from "socket.io-client";
import { env } from "~/config/env";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const socketUrl = env.API_BASE_URL.replace("/api", "");
    this.socket = io(socketUrl, {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
