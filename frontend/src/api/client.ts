const API_BASE = "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Arduino
export const connectArduino = (port?: string, baudRate?: number) =>
  request<{ success: boolean; error?: string }>("/arduino/connect", {
    method: "POST",
    body: JSON.stringify({ port, baudRate }),
  });

export const disconnectArduino = () =>
  request("/arduino/disconnect", { method: "POST" });

export const getArduinoStatus = () =>
  request<{ connected: boolean; data: StrollerData }>("/arduino/status");

export const setStrollerSpeed = (speed: number) =>
  request("/arduino/speed", {
    method: "POST",
    body: JSON.stringify({ speed }),
  });

export const emergencyStop = () =>
  request("/arduino/stop", { method: "POST" });

export const listPorts = () =>
  request<{ ports: string[] }>("/arduino/ports");

// Run sessions
export const startRun = (targetPace?: number) =>
  request<{ sessionId: string }>("/run/start", {
    method: "POST",
    body: JSON.stringify({ targetPace }),
  });

export const endRun = (sessionId: string) =>
  request<{ session: RunSession; insights: RunInsights }>(`/run/end/${sessionId}`, {
    method: "POST",
  });

export const getRunInsights = (sessionId: string) =>
  request<RunInsights>(`/run/insights/${sessionId}`);

export const listSessions = () =>
  request<RunSessionSummary[]>("/run/sessions");

// Training plans
export const generatePlan = (params: GeneratePlanParams) =>
  request<TrainingPlan>("/training/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });

export const getPlans = () => request<TrainingPlan[]>("/training");

export const getPlan = (id: string) =>
  request<TrainingPlan>(`/training/${id}`);

export const deletePlan = (id: string) =>
  request(`/training/${id}`, { method: "DELETE" });

// Types
export interface StrollerData {
  speed: number;
  distance: number;
  batteryLevel: number;
  motorStatus: "idle" | "running" | "error";
  timestamp: number;
}

export interface RunSession {
  id: string;
  startTime: number;
  endTime?: number;
  targetPace: number;
  dataPoints: { timestamp: number; speed: number; distance: number }[];
}

export interface RunSessionSummary {
  id: string;
  startTime: number;
  endTime?: number;
  targetPace: number;
  dataPointCount: number;
}

export interface RunInsights {
  totalDistance: number;
  duration: number;
  avgPace: number;
  avgSpeed: number;
  maxSpeed: number;
  splits: { km: number; pace: number }[];
  consistencyScore: number;
}

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
  weeklyDistance: number;
}

export interface TrainingDay {
  day: string;
  type: "easy" | "tempo" | "interval" | "long" | "rest" | "cross-training";
  description: string;
  targetDistance?: number;
  targetPace?: number;
  targetDuration?: number;
}

export interface GeneratePlanParams {
  goal: string;
  currentPace: number;
  weeklyDistance: number;
  weeks?: number;
}
