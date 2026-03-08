import { Router, Request, Response } from "express";
import { ArduinoService } from "../services/arduino";

export function arduinoRoutes(arduino: ArduinoService): Router {
  const router = Router();

  // Connect to Arduino
  router.post("/connect", async (req: Request, res: Response) => {
    const { port, baudRate } = req.body;
    const result = await arduino.connect(port, baudRate);
    res.json(result);
  });

  // Disconnect
  router.post("/disconnect", (_req: Request, res: Response) => {
    arduino.disconnect();
    res.json({ success: true });
  });

  // Get connection status + latest data
  router.get("/status", (_req: Request, res: Response) => {
    res.json({
      connected: arduino.isConnected(),
      data: arduino.getLatestData(),
    });
  });

  // Set stroller speed
  router.post("/speed", (req: Request, res: Response) => {
    const { speed } = req.body;
    if (typeof speed !== "number" || speed < 0 || speed > 5) {
      res.status(400).json({ error: "Speed must be 0-5 m/s" });
      return;
    }
    arduino.setSpeed(speed);
    res.json({ success: true, speed });
  });

  // Emergency stop
  router.post("/stop", (_req: Request, res: Response) => {
    arduino.stop();
    res.json({ success: true });
  });

  // List available serial ports
  router.get("/ports", async (_req: Request, res: Response) => {
    const ports = await ArduinoService.listPorts();
    res.json({ ports });
  });

  return router;
}
