import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="page">
      <h1>🐇 BunBot</h1>
      <p className="subtitle">Your pacing stroller companion</p>

      <div className="card-grid">
        <Link to="/stroller" className="card">
          <h2>🎮 Stroller Control</h2>
          <p>Connect to Arduino, set pace, and control the stroller in real-time.</p>
        </Link>

        <Link to="/run" className="card">
          <h2>🏃 Run Session</h2>
          <p>Start a run, track your pace, and get live insights.</p>
        </Link>

        <Link to="/training" className="card">
          <h2>📋 Training Plans</h2>
          <p>Generate personalized running plans to reach your goals.</p>
        </Link>

        <Link to="/history" className="card">
          <h2>📊 Run History</h2>
          <p>View past sessions, splits, and consistency scores.</p>
        </Link>
      </div>
    </div>
  );
}
