import { Router, Request, Response } from "express";
import { RunSession, RunDataPoint } from "../models/run";
import { computeInsights } from "../utils/insights";
import crypto from "crypto";

// In-memory store (swap for a database later)
const sessions: Map<string, RunSession> = new Map();

export function runRoutes(): Router {
  const router = Router();

  // Start a new run session
  router.post("/start", (req: Request, res: Response) => {
    const { targetPace } = req.body;
    const session: RunSession = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      targetPace: targetPace || 6, // default 6:00/km
      dataPoints: [],
    };
    sessions.set(session.id, session);
    res.json({ sessionId: session.id });
  });

  // Record a data point for a session
  router.post("/data/:sessionId", (req: Request<{sessionId: string}>, res: Response) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const dp: RunDataPoint = {
      timestamp: Date.now(),
      speed: req.body.speed,
      distance: req.body.distance,
    };
    session.dataPoints.push(dp);
    res.json({ recorded: true });
  });

  // End a session
  router.post("/end/:sessionId", (req: Request<{sessionId: string}>, res: Response) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    session.endTime = Date.now();
    const insights = computeInsights(session.dataPoints);
    res.json({ session, insights });
  });

  // Get insights for a session
  router.get("/insights/:sessionId", (req: Request<{sessionId: string}>, res: Response) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const insights = computeInsights(session.dataPoints);
    res.json(insights);
  });

  // List all sessions
  router.get("/sessions", (_req: Request, res: Response) => {
    const list = Array.from(sessions.values()).map((s) => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      targetPace: s.targetPace,
      dataPointCount: s.dataPoints.length,
    }));
    res.json(list);
  });

  return router;
}
