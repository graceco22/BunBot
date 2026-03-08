export interface TrainingPlan {
  id: string;
  name: string;
  goal: string;
  weekCount: number;
  weeks: TrainingWeek[];
  createdAt: number;
}

export interface TrainingWeek {
  weekNumber: number;
  days: TrainingDay[];
  weeklyDistance: number; // km
}

export interface TrainingDay {
  day: string;
  type: "easy" | "tempo" | "interval" | "long" | "rest" | "cross-training";
  description: string;
  targetDistance?: number; // km
  targetPace?: number; // min/km
  targetDuration?: number; // minutes
}
