import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { arduinoRoutes } from "./routes/arduino";
import { runRoutes } from "./routes/run";
import { trainingRoutes } from "./routes/training";
import { ArduinoService } from "./services/arduino";
import { setupWebSocket } from "./services/websocket";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Initialize Arduino service
const arduinoService = ArduinoService.getInstance();

// Routes
app.use("/api/arduino", arduinoRoutes(arduinoService));
app.use("/api/run", runRoutes());
app.use("/api/training", trainingRoutes());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", arduino: arduinoService.isConnected() });
});

// WebSocket for real-time stroller data
setupWebSocket(wss, arduinoService);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`BunBot server running on port ${PORT}`);
});
