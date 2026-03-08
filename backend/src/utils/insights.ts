import { RunDataPoint, RunInsights, SplitTime } from "../models/run";

/** Compute run insights from recorded data points. */
export function computeInsights(dataPoints: RunDataPoint[]): RunInsights {
  if (dataPoints.length < 2) {
    return {
      totalDistance: 0,
      duration: 0,
      avgPace: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      splits: [],
      consistencyScore: 0,
    };
  }

  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];
  const totalDistance = last.distance - first.distance;
  const duration = (last.timestamp - first.timestamp) / 1000; // seconds
  const avgSpeed = duration > 0 ? totalDistance / duration : 0;
  const avgPace = avgSpeed > 0 ? (1000 / avgSpeed) / 60 : 0; // min/km
  const maxSpeed = Math.max(...dataPoints.map((d) => d.speed));

  // Compute per-km splits
  const splits: SplitTime[] = [];
  let nextKm = 1000;
  let splitStart = first;
  for (const dp of dataPoints) {
    if (dp.distance - first.distance >= nextKm) {
      const splitDuration = (dp.timestamp - splitStart.timestamp) / 1000;
      const splitDist = dp.distance - splitStart.distance;
      const splitPace = splitDist > 0 ? ((splitDuration / splitDist) * 1000) / 60 : 0;
      splits.push({ km: nextKm / 1000, pace: Math.round(splitPace * 100) / 100 });
      splitStart = dp;
      nextKm += 1000;
    }
  }

  // Consistency = how steady the pace was (lower std-dev of speed = higher score)
  const speeds = dataPoints.map((d) => d.speed).filter((s) => s > 0);
  const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const variance = speeds.reduce((sum, s) => sum + (s - mean) ** 2, 0) / speeds.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;
  const consistencyScore = Math.round(Math.max(0, Math.min(100, (1 - cv) * 100)));

  return {
    totalDistance: Math.round(totalDistance),
    duration: Math.round(duration),
    avgPace: Math.round(avgPace * 100) / 100,
    avgSpeed: Math.round(avgSpeed * 100) / 100,
    maxSpeed: Math.round(maxSpeed * 100) / 100,
    splits,
    consistencyScore,
  };
}

export function formatPace(paceMinPerKm: number): string {
  const mins = Math.floor(paceMinPerKm);
  const secs = Math.round((paceMinPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /km`;
}
