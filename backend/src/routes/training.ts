import { Router, Request, Response } from "express";
import { TrainingPlan, TrainingWeek, TrainingDay } from "../models/training";
import crypto from "crypto";

const plans: Map<string, TrainingPlan> = new Map();

export function trainingRoutes(): Router {
  const router = Router();

  // Generate a training plan
  router.post("/generate", (req: Request, res: Response) => {
    const { goal, currentPace, weeklyDistance, weeks } = req.body;
    const weekCount = weeks || 8;
    const plan = generatePlan(goal, currentPace, weeklyDistance, weekCount);
    plans.set(plan.id, plan);
    res.json(plan);
  });

  // Get a specific plan
  router.get("/:planId", (req: Request<{planId: string}>, res: Response) => {
    const plan = plans.get(req.params.planId);
    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }
    res.json(plan);
  });

  // List all plans
  router.get("/", (_req: Request, res: Response) => {
    res.json(Array.from(plans.values()));
  });

  // Delete a plan
  router.delete("/:planId", (req: Request<{planId: string}>, res: Response) => {
    plans.delete(req.params.planId);
    res.json({ deleted: true });
  });

  return router;
}

function generatePlan(
  goal: string,
  currentPace: number, // min/km
  weeklyDistance: number, // km
  weekCount: number
): TrainingPlan {
  const weeks: TrainingWeek[] = [];

  for (let w = 1; w <= weekCount; w++) {
    const progress = w / weekCount;
    // Gradually increase weekly distance (peak at ~80%, taper last 2 weeks)
    let distMultiplier: number;
    if (w > weekCount - 2) {
      distMultiplier = 0.6 + 0.2 * (weekCount - w); // taper
    } else {
      distMultiplier = 1 + progress * 0.5;
    }
    const weekDist = Math.round(weeklyDistance * distMultiplier * 10) / 10;

    const days = buildWeekDays(weekDist, currentPace, progress);
    weeks.push({ weekNumber: w, days, weeklyDistance: weekDist });
  }

  return {
    id: crypto.randomUUID(),
    name: `${goal} Plan`,
    goal,
    weekCount,
    weeks,
    createdAt: Date.now(),
  };
}

function buildWeekDays(
  weekDist: number,
  pace: number,
  progress: number
): TrainingDay[] {
  const easyPace = pace + 0.5;
  const tempoPace = pace - 0.3 - progress * 0.2;
  const longDist = weekDist * 0.35;
  const easyDist = weekDist * 0.15;
  const tempoDist = weekDist * 0.2;

  return [
    {
      day: "Monday",
      type: "easy",
      description: "Easy recovery run",
      targetDistance: round(easyDist),
      targetPace: round(easyPace),
    },
    {
      day: "Tuesday",
      type: "interval",
      description: `${4 + Math.floor(progress * 4)}x400m repeats with 90s rest`,
      targetDistance: round(weekDist * 0.12),
      targetPace: round(tempoPace - 0.5),
    },
    {
      day: "Wednesday",
      type: "rest",
      description: "Rest or light stretching",
    },
    {
      day: "Thursday",
      type: "tempo",
      description: "Sustained tempo run",
      targetDistance: round(tempoDist),
      targetPace: round(tempoPace),
    },
    {
      day: "Friday",
      type: "easy",
      description: "Easy run",
      targetDistance: round(easyDist),
      targetPace: round(easyPace),
    },
    {
      day: "Saturday",
      type: "long",
      description: "Long run at conversational pace",
      targetDistance: round(longDist),
      targetPace: round(easyPace + 0.3),
    },
    {
      day: "Sunday",
      type: "rest",
      description: "Full rest day",
    },
  ];
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
