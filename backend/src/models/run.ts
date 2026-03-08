export interface RunSession {
  id: string;
  startTime: number;
  endTime?: number;
  targetPace: number; // min/km
  dataPoints: RunDataPoint[];
}

export interface RunDataPoint {
  timestamp: number;
  speed: number; // m/s
  distance: number; // meters cumulative
}

export interface RunInsights {
  totalDistance: number; // meters
  duration: number; // seconds
  avgPace: number; // min/km
  avgSpeed: number; // m/s
  maxSpeed: number; // m/s
  splits: SplitTime[];
  consistencyScore: number; // 0-100
}

export interface SplitTime {
  km: number;
  pace: number; // min/km
}
