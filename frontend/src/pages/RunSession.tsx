import { useState } from "react";
import { startRun, endRun } from "../api/client";
import { useStrollerSocket } from "../hooks/useStrollerSocket";
import type { RunInsights } from "../api/client";

export default function RunSession() {
  const { data, sendSpeed } = useStrollerSocket();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [targetPace, setTargetPace] = useState(6);
  const [insights, setInsights] = useState<RunInsights | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

  const paceToSpeed = (pace: number) => 1000 / (pace * 60);

  const formatPace = (pace: number) => {
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    const { sessionId: id } = await startRun(targetPace);
    setSessionId(id);
    setRunning(true);
    setInsights(null);
    setElapsed(0);
    sendSpeed(paceToSpeed(targetPace));
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    setTimerRef(t);
  };

  const handleStop = async () => {
    if (!sessionId) return;
    if (timerRef) clearInterval(timerRef);
    const result = await endRun(sessionId);
    setInsights(result.insights);
    setRunning(false);
    sendSpeed(0);
  };

  const maxSplitPace = insights
    ? Math.max(...insights.splits.map((s) => s.pace), 1)
    : 1;

  return (
    <div className="page">
      <h1>Run Session</h1>
      <p className="subtitle">Set your pace and go</p>

      {/* Setup */}
      {!running && !insights && (
        <section className="card">
          <h2>Target Pace</h2>
          <div className="speed-display">
            {formatPace(targetPace)}
            <span className="speed-unit"> /km</span>
          </div>
          <span className="pace-hint">
            {paceToSpeed(targetPace).toFixed(2)} m/s
          </span>
          <input
            type="range"
            min="3"
            max="10"
            step="0.1"
            value={targetPace}
            onChange={(e) => setTargetPace(Number(e.target.value))}
          />
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button onClick={handleStart}>Start Run</button>
          </div>
        </section>
      )}

      {/* Active run */}
      {running && (
        <section className="card active-run">
          <h2>In Progress</h2>
          <div className="stats-grid">
            <div className="stat stat-big">
              <span className="stat-value">{formatTime(elapsed)}</span>
              <span className="stat-label">Elapsed</span>
            </div>
            {data && (
              <>
                <div className="stat stat-big">
                  <span className="stat-value">{data.speed.toFixed(2)}</span>
                  <span className="stat-label">Speed m/s</span>
                </div>
                <div className="stat stat-big">
                  <span className="stat-value">
                    {(data.distance / 1000).toFixed(2)}
                  </span>
                  <span className="stat-label">Kilometers</span>
                </div>
              </>
            )}
            <div className="stat stat-big">
              <span className="stat-value">{formatPace(targetPace)}</span>
              <span className="stat-label">Target /km</span>
            </div>
          </div>

          {/* Pace bar */}
          {data && (
            <div className="pace-bar-container">
              <div className="pace-bar-label">
                <span>Current pace vs target</span>
                <span>
                  {data.speed > 0
                    ? formatPace((1000 / data.speed) / 60)
                    : "--:--"}{" "}
                  / {formatPace(targetPace)}
                </span>
              </div>
              <div className="pace-bar-track">
                <div
                  className="pace-bar-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.speed / paceToSpeed(targetPace)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button className="danger" onClick={handleStop}>
              End Run
            </button>
          </div>
        </section>
      )}

      {/* Post-run insights */}
      {insights && (
        <>
          <section className="card">
            <h2>Run Complete</h2>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">
                  {(insights.totalDistance / 1000).toFixed(2)}
                </span>
                <span className="stat-label">Kilometers</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {Math.floor(insights.duration / 60)}:
                  {(insights.duration % 60).toString().padStart(2, "0")}
                </span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {formatPace(insights.avgPace)}
                </span>
                <span className="stat-label">Avg Pace /km</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {insights.consistencyScore}
                </span>
                <span className="stat-label">Consistency</span>
              </div>
            </div>
            <div className="detail-pills">
              <span className="pill">
                ~{Math.round((insights.totalDistance / 1000) * 70)} kcal
              </span>
              <span className="pill">Max {insights.maxSpeed.toFixed(1)} m/s</span>
            </div>
          </section>

          {insights.splits.length > 0 && (
            <section className="card">
              <h2>Splits</h2>
              <table className="splits-table">
                <thead>
                  <tr>
                    <th>KM</th>
                    <th>Pace</th>
                    <th className="bar-cell">Relative</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.splits.map((s) => (
                    <tr key={s.km}>
                      <td>{s.km}</td>
                      <td className="pace-cell">{formatPace(s.pace)}</td>
                      <td className="bar-cell">
                        <div className="split-bar">
                          <div
                            className="split-bar-fill"
                            style={{
                              width: `${(s.pace / maxSplitPace) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button onClick={() => setInsights(null)}>New Run</button>
          </div>
        </>
      )}
    </div>
  );
}
