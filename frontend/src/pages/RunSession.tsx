import { useState } from "react";
import { startRun, endRun } from "../api/client";
import { useStrollerSocket } from "../hooks/useStrollerSocket";
import type { RunInsights } from "../api/client";

export default function RunSession() {
  const { data, sendSpeed } = useStrollerSocket();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [targetPace, setTargetPace] = useState(6); // min/km
  const [insights, setInsights] = useState<RunInsights | null>(null);
  const [running, setRunning] = useState(false);

  const paceToSpeed = (pace: number) => (1000 / (pace * 60)); // min/km -> m/s

  const handleStart = async () => {
    const { sessionId: id } = await startRun(targetPace);
    setSessionId(id);
    setRunning(true);
    setInsights(null);
    sendSpeed(paceToSpeed(targetPace));
  };

  const handleStop = async () => {
    if (!sessionId) return;
    const result = await endRun(sessionId);
    setInsights(result.insights);
    setRunning(false);
    sendSpeed(0);
  };

  const formatPace = (pace: number) => {
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="page">
      <h1>🏃 Run Session</h1>

      {/* Setup */}
      {!running && !insights && (
        <section className="card">
          <h2>Set Your Target Pace</h2>
          <label>
            Pace: <strong>{formatPace(targetPace)} /km</strong>
          </label>
          <input
            type="range"
            min="3"
            max="10"
            step="0.1"
            value={targetPace}
            onChange={(e) => setTargetPace(Number(e.target.value))}
          />
          <button onClick={handleStart}>Start Run</button>
        </section>
      )}

      {/* Active run */}
      {running && (
        <section className="card active-run">
          <h2>Running...</h2>
          {data && (
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">{data.speed.toFixed(2)}</span>
                <span className="stat-label">Current m/s</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {(data.distance / 1000).toFixed(2)}
                </span>
                <span className="stat-label">km</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatPace(targetPace)}</span>
                <span className="stat-label">Target /km</span>
              </div>
            </div>
          )}
          <button className="danger" onClick={handleStop}>
            End Run
          </button>
        </section>
      )}

      {/* Insights */}
      {insights && (
        <section className="card">
          <h2>Run Complete! 🎉</h2>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">
                {(insights.totalDistance / 1000).toFixed(2)}
              </span>
              <span className="stat-label">km</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {Math.floor(insights.duration / 60)}:
                {(insights.duration % 60).toString().padStart(2, "0")}
              </span>
              <span className="stat-label">Duration</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatPace(insights.avgPace)}</span>
              <span className="stat-label">Avg Pace /km</span>
            </div>
            <div className="stat">
              <span className="stat-value">{insights.consistencyScore}</span>
              <span className="stat-label">Consistency</span>
            </div>
          </div>

          {insights.splits.length > 0 && (
            <>
              <h3>Splits</h3>
              <table className="splits-table">
                <thead>
                  <tr>
                    <th>KM</th>
                    <th>Pace</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.splits.map((s) => (
                    <tr key={s.km}>
                      <td>{s.km}</td>
                      <td>{formatPace(s.pace)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <button onClick={() => setInsights(null)}>New Run</button>
        </section>
      )}
    </div>
  );
}
