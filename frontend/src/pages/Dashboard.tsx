import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="page">
      <div className="hero">
        <h1>BunBot</h1>
        <p className="subtitle">
          Your pacing stroller companion — run smarter, train better.
        </p>
      </div>

      <div className="quick-stats">
        <div className="quick-stat">
          <div className="qs-value">0</div>
          <div className="qs-label">Total Runs</div>
        </div>
        <div className="quick-stat">
          <div className="qs-value">0.0 km</div>
          <div className="qs-label">Distance</div>
        </div>
        <div className="quick-stat">
          <div className="qs-value">--:--</div>
          <div className="qs-label">Best Pace</div>
        </div>
        <div className="quick-stat">
          <div className="qs-value">--</div>
          <div className="qs-label">Consistency</div>
        </div>
      </div>

      <div className="card-grid">
        <Link to="/pacer" className="card">
          <h2>Pacer Control</h2>
          <p>Connect to BunBot, set your target pace, and let it lead you through your run.</p>
        </Link>

        <Link to="/run" className="card">
          <h2>Start a Run</h2>
          <p>Set your goal pace, start running, and get live feedback as you go.</p>
        </Link>

        <Link to="/insights" className="card">
          <h2>Run Insights</h2>
          <p>Deep dive into your splits, pace zones, consistency, and performance trends.</p>
        </Link>

        <Link to="/training" className="card">
          <h2>Training Plans</h2>
          <p>Generate week-by-week plans tailored to your current fitness and goals.</p>
        </Link>
      </div>
    </div>
  );
}
