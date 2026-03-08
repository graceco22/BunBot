import { WebSocketServer, WebSocket } from "ws";
import { ArduinoService, StrollerData } from "./arduino";

export function setupWebSocket(
  wss: WebSocketServer,
  arduino: ArduinoService
): void {
  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    // Forward Arduino data to all connected clients
    const onData = (data: StrollerData) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "stroller_data", payload: data }));
      }
    };
    arduino.on("data", onData);

    // Handle commands from the frontend
    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        switch (msg.type) {
          case "set_speed":
            arduino.setSpeed(msg.speed);
            break;
          case "stop":
            arduino.stop();
            break;
        }
      } catch {
        // ignore bad messages
      }
    });

    ws.on("close", () => {
      arduino.off("data", onData);
      console.log("WebSocket client disconnected");
    });
  });
}
