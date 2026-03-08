import { useState, useEffect } from "react";
import { listSessions, getRunInsights, type RunSessionSummary, type RunInsights } from "../api/client";

export default function RunHistory() {
  const [sessions, setSessions] = useState<RunSessionSummary[]>([]);
  const [selectedInsights, setSelectedInsights] = useState<RunInsights | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    listSessions().then(setSessions);
  }, []);

  const viewInsights = async (id: string) => {
    const insights = await getRunInsights(id);
    setSelectedInsights(insights);
    setSelectedId(id);
  };

  const formatPace = (pace: number) => {
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="page">
      <h1>📊 Run History</h1>

      {sessions.length === 0 && (
        <section className="card">
          <p>No runs recorded yet. Start a run session to see your history here!</p>
        </section>
      )}

      {sessions.map((s) => (
        <section
          key={s.id}
          className={`card clickable ${selectedId === s.id ? "selected" : ""}`}
          onClick={() => viewInsights(s.id)}
        >
          <div className="session-row">
            <span>{new Date(s.startTime).toLocaleString()}</span>
            <span>{s.dataPointCount} data points</span>
            <span>Target: {formatPace(s.targetPace)} /km</span>
            <span>{s.endTime ? "✅ Completed" : "⏳ In Progress"}</span>
          </div>

          {selectedId === s.id && selectedInsights && (
            <div className="stats-grid" style={{ marginTop: "1rem" }}>
              <div className="stat">
                <span className="stat-value">
                  {(selectedInsights.totalDistance / 1000).toFixed(2)}
                </span>
                <span className="stat-label">km</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {Math.floor(selectedInsights.duration / 60)}:
                  {(selectedInsights.duration % 60).toString().padStart(2, "0")}
                </span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {formatPace(selectedInsights.avgPace)}
                </span>
                <span className="stat-label">Avg Pace</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {selectedInsights.consistencyScore}
                </span>
                <span className="stat-label">Consistency</span>
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
