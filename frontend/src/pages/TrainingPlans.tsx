import { useState, useEffect } from "react";
import {
  generatePlan,
  getPlans,
  deletePlan,
  type TrainingPlan,
} from "../api/client";

export default function TrainingPlans() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [goal, setGoal] = useState("5K");
  const [currentPace, setCurrentPace] = useState(6);
  const [weeklyDistance, setWeeklyDistance] = useState(20);
  const [weeks, setWeeks] = useState(8);

  useEffect(() => {
    getPlans().then(setPlans);
  }, []);

  const handleGenerate = async () => {
    const plan = await generatePlan({ goal, currentPace, weeklyDistance, weeks });
    setPlans((prev) => [...prev, plan]);
    setSelectedPlan(plan);
  };

  const handleDelete = async (id: string) => {
    await deletePlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlan?.id === id) setSelectedPlan(null);
  };

  const formatPace = (pace: number) => {
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const typeColors: Record<string, string> = {
    easy: "#4CAF50",
    tempo: "#FF9800",
    interval: "#F44336",
    long: "#2196F3",
    rest: "#9E9E9E",
    "cross-training": "#9C27B0",
  };

  return (
    <div className="page">
      <h1>📋 Training Plans</h1>

      {/* Generator */}
      <section className="card">
        <h2>Generate a Plan</h2>
        <div className="form-grid">
          <label>
            Goal
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="5K">5K</option>
              <option value="10K">10K</option>
              <option value="Half Marathon">Half Marathon</option>
              <option value="Marathon">Marathon</option>
              <option value="General Fitness">General Fitness</option>
            </select>
          </label>
          <label>
            Current Pace ({formatPace(currentPace)} /km)
            <input
              type="range"
              min="3"
              max="10"
              step="0.1"
              value={currentPace}
              onChange={(e) => setCurrentPace(Number(e.target.value))}
            />
          </label>
          <label>
            Weekly Distance ({weeklyDistance} km)
            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={weeklyDistance}
              onChange={(e) => setWeeklyDistance(Number(e.target.value))}
            />
          </label>
          <label>
            Weeks: {weeks}
            <input
              type="range"
              min="4"
              max="20"
              step="1"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
            />
          </label>
        </div>
        <button onClick={handleGenerate}>Generate Plan</button>
      </section>

      {/* Plan list */}
      {plans.length > 0 && !selectedPlan && (
        <section className="card">
          <h2>Your Plans</h2>
          <ul className="plan-list">
            {plans.map((p) => (
              <li key={p.id}>
                <button className="link" onClick={() => setSelectedPlan(p)}>
                  {p.name}
                </button>
                <span className="meta">
                  {p.weekCount} weeks &middot;{" "}
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <button
                  className="small danger"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Plan detail */}
      {selectedPlan && (
        <section className="card">
          <div className="plan-header">
            <h2>{selectedPlan.name}</h2>
            <button className="small secondary" onClick={() => setSelectedPlan(null)}>
              ← Back
            </button>
          </div>
          {selectedPlan.weeks.map((week) => (
            <div key={week.weekNumber} className="week-block">
              <h3>
                Week {week.weekNumber}{" "}
                <span className="meta">{week.weeklyDistance} km</span>
              </h3>
              <div className="days-grid">
                {week.days.map((day) => (
                  <div
                    key={day.day}
                    className="day-card"
                    style={{ borderLeftColor: typeColors[day.type] }}
                  >
                    <strong>{day.day}</strong>
                    <span
                      className="day-type"
                      style={{ color: typeColors[day.type] }}
                    >
                      {day.type}
                    </span>
                    <p>{day.description}</p>
                    {day.targetDistance && <span>{day.targetDistance} km</span>}
                    {day.targetPace && (
                      <span> @ {formatPace(day.targetPace)} /km</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
