import { useState, useEffect } from "react";
import {
  listSessions,
  getRunInsights,
  type RunSessionSummary,
  type RunInsights,
} from "../api/client";

// Sample data shown when no real runs exist
const SAMPLE_INSIGHTS: RunInsights = {
  totalDistance: 5230,
  duration: 1860,
  avgPace: 5.93,
  avgSpeed: 2.81,
  maxSpeed: 3.45,
  splits: [
    { km: 1, pace: 6.1 },
    { km: 2, pace: 5.85 },
    { km: 3, pace: 5.72 },
    { km: 4, pace: 5.9 },
    { km: 5, pace: 6.05 },
  ],
  consistencyScore: 82,
};

const SAMPLE_SESSIONS: RunSessionSummary[] = [
  { id: "sample-1", startTime: Date.now() - 86400000 * 2, endTime: Date.now() - 86400000 * 2 + 1860000, targetPace: 6, dataPointCount: 93 },
  { id: "sample-2", startTime: Date.now() - 86400000 * 5, endTime: Date.now() - 86400000 * 5 + 2400000, targetPace: 6.5, dataPointCount: 120 },
  { id: "sample-3", startTime: Date.now() - 86400000 * 8, endTime: Date.now() - 86400000 * 8 + 1500000, targetPace: 5.5, dataPointCount: 75 },
];

const SAMPLE_HISTORY = [
  { date: "Mon", distance: 3.2 },
  { date: "Tue", distance: 0 },
  { date: "Wed", distance: 5.1 },
  { date: "Thu", distance: 4.0 },
  { date: "Fri", distance: 0 },
  { date: "Sat", distance: 8.2 },
  { date: "Sun", distance: 3.5 },
];

export default function Insights() {
  const [sessions, setSessions] = useState<RunSessionSummary[]>([]);
  const [insights, setInsights] = useState<RunInsights | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [usingSample, setUsingSample] = useState(false);

  useEffect(() => {
    listSessions()
      .then((data) => {
        if (data.length === 0) {
          setSessions(SAMPLE_SESSIONS);
          setInsights(SAMPLE_INSIGHTS);
          setSelectedId("sample-1");
          setUsingSample(true);
        } else {
          setSessions(data);
          if (data.length > 0) {
            selectSession(data[0].id);
          }
        }
      })
      .catch(() => {
        setSessions(SAMPLE_SESSIONS);
        setInsights(SAMPLE_INSIGHTS);
        setSelectedId("sample-1");
        setUsingSample(true);
      });
  }, []);

  const selectSession = async (id: string) => {
    setSelectedId(id);
    if (id.startsWith("sample-")) {
      setInsights(SAMPLE_INSIGHTS);
      setUsingSample(true);
    } else {
      const data = await getRunInsights(id);
      setInsights(data);
      setUsingSample(false);
    }
  };

  const formatPace = (pace: number) => {
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Pace zones (approximate)
  const getZones = (splits: { km: number; pace: number }[]) => {
    let easy = 0, moderate = 0, tempo = 0, threshold = 0;
    for (const s of splits) {
      if (s.pace >= 6.5) easy++;
      else if (s.pace >= 5.5) moderate++;
      else if (s.pace >= 4.5) tempo++;
      else threshold++;
    }
    const total = splits.length || 1;
    return { easy, moderate, tempo, threshold, total };
  };

  // Estimated calories (rough: 1 kcal per kg per km, assume 70kg)
  const estCalories = insights ? Math.round((insights.totalDistance / 1000) * 70) : 0;

  const zones = insights ? getZones(insights.splits) : null;
  const maxSplitPace = insights ? Math.max(...insights.splits.map((s) => s.pace), 1) : 1;

  // Weekly chart max
  const weekMax = Math.max(...SAMPLE_HISTORY.map((d) => d.distance), 1);

  return (
    <div className="page">
      <h1>Run Insights</h1>
      <p className="subtitle">
        {usingSample
          ? "Showing sample data — complete a run to see your real stats."
          : "Your performance breakdown"}
      </p>

      {insights && (
        <>
          {/* Top stats */}
          <div className="stats-grid">
            <div className="stat stat-big">
              <span className="stat-value">
                {(insights.totalDistance / 1000).toFixed(2)}
              </span>
              <span className="stat-label">Kilometers</span>
            </div>
            <div className="stat stat-big">
              <span className="stat-value">{formatDuration(insights.duration)}</span>
              <span className="stat-label">Duration</span>
            </div>
            <div className="stat stat-big">
              <span className="stat-value">{formatPace(insights.avgPace)}</span>
              <span className="stat-label">Avg Pace /km</span>
            </div>
            <div className="stat stat-big">
              <span className="stat-value">{insights.maxSpeed.toFixed(1)}</span>
              <span className="stat-label">Max Speed m/s</span>
            </div>
          </div>

          <div className="detail-pills">
            <span className="pill">~{estCalories} kcal</span>
            <span className="pill">{insights.splits.length} splits</span>
            <span className="pill">Avg {insights.avgSpeed.toFixed(2)} m/s</span>
          </div>

          <div className="insights-grid" style={{ marginTop: "1rem" }}>
            {/* Consistency Ring */}
            <div className="card">
              <h2>Consistency Score</h2>
              <div className="consistency-ring">
                <svg className="ring-svg" width="120" height="120" viewBox="0 0 120 120">
                  <circle className="ring-bg" cx="60" cy="60" r="50" strokeWidth="10" />
                  <circle
                    className="ring-fill"
                    cx="60" cy="60" r="50"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - insights.consistencyScore / 100)}`}
                  />
                  <text className="ring-text" x="60" y="60">
                    {insights.consistencyScore}
                  </text>
                </svg>
                <span className="ring-label">
                  {insights.consistencyScore >= 80
                    ? "Excellent pacing"
                    : insights.consistencyScore >= 60
                    ? "Good consistency"
                    : "Room to improve"}
                </span>
              </div>
            </div>

            {/* Pace Zones */}
            {zones && (
              <div className="card">
                <h2>Pace Zones</h2>
                <div className="zone-bar">
                  {zones.easy > 0 && (
                    <div
                      style={{
                        width: `${(zones.easy / zones.total) * 100}%`,
                        background: "#86efac",
                      }}
                    />
                  )}
                  {zones.moderate > 0 && (
                    <div
                      style={{
                        width: `${(zones.moderate / zones.total) * 100}%`,
                        background: "#fbbf24",
                      }}
                    />
                  )}
                  {zones.tempo > 0 && (
                    <div
                      style={{
                        width: `${(zones.tempo / zones.total) * 100}%`,
                        background: "#f97316",
                      }}
                    />
                  )}
                  {zones.threshold > 0 && (
                    <div
                      style={{
                        width: `${(zones.threshold / zones.total) * 100}%`,
                        background: "#ef4444",
                      }}
                    />
                  )}
                </div>
                <div className="zone-legend">
                  <span><span className="zone-dot" style={{ background: "#86efac" }} /> Easy ({zones.easy})</span>
                  <span><span className="zone-dot" style={{ background: "#fbbf24" }} /> Moderate ({zones.moderate})</span>
                  <span><span className="zone-dot" style={{ background: "#f97316" }} /> Tempo ({zones.tempo})</span>
                  <span><span className="zone-dot" style={{ background: "#ef4444" }} /> Threshold ({zones.threshold})</span>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <div className="insight-row">
                    <span className="label">Fastest split</span>
                    <span className="value">
                      {formatPace(Math.min(...insights.splits.map((s) => s.pace)))} /km
                    </span>
                  </div>
                  <div className="insight-row">
                    <span className="label">Slowest split</span>
                    <span className="value">
                      {formatPace(Math.max(...insights.splits.map((s) => s.pace)))} /km
                    </span>
                  </div>
                  <div className="insight-row">
                    <span className="label">Pace variation</span>
                    <span className="value">
                      {(
                        Math.max(...insights.splits.map((s) => s.pace)) -
                        Math.min(...insights.splits.map((s) => s.pace))
                      ).toFixed(2)}{" "}
                      min/km
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Splits Table */}
          {insights.splits.length > 0 && (
            <div className="card" style={{ marginTop: "0.75rem" }}>
              <h2>Split Breakdown</h2>
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
                            style={{ width: `${(s.pace / maxSplitPace) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Weekly Distance Chart (sample) */}
          <div className="card" style={{ marginTop: "0.75rem" }}>
            <h2>Weekly Distance</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 120, marginTop: "0.75rem" }}>
              {SAMPLE_HISTORY.map((d) => (
                <div key={d.date} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      height: `${(d.distance / weekMax) * 100}px`,
                      background:
                        d.distance > 0
                          ? "linear-gradient(to top, var(--pink-400), var(--pink-300))"
                          : "var(--pink-100)",
                      borderRadius: "6px 6px 0 0",
                      minHeight: d.distance > 0 ? 8 : 4,
                      transition: "height 0.3s",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      marginTop: "0.35rem",
                      fontWeight: 600,
                    }}
                  >
                    {d.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* History list */}
      <div className="section-header" style={{ marginTop: "1.5rem" }}>
        <h2>Run History</h2>
      </div>

      {sessions.length === 0 ? (
        <div className="card empty-state">
          <p>No runs yet. Start a session to build your history.</p>
        </div>
      ) : (
        sessions.map((s) => (
          <section
            key={s.id}
            className={`card clickable ${selectedId === s.id ? "selected" : ""}`}
            onClick={() => selectSession(s.id)}
          >
            <div className="session-row">
              <span style={{ fontWeight: 600 }}>
                {new Date(s.startTime).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>{s.dataPointCount} points</span>
              <span>Target {formatPace(s.targetPace)} /km</span>
              <span>
                {s.endTime ? (
                  <span className="status connected">Completed</span>
                ) : (
                  <span className="status disconnected">In Progress</span>
                )}
              </span>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
