import { Server } from "http";
import { WebSocketServer } from "ws";

export function extendHttpServer(httpServer: Server) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    console.log("WebSocket connected");

    ws.on("message", (message) => {
      console.log(`Received message: ${message}`);
      try {
        const parsedMessage = JSON.parse(message.toString());
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
}
