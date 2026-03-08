import { useState, useEffect } from "react";
import {
  generatePlan,
  getPlans,
  deletePlan,
  type TrainingPlan,
  type TrainingWeek,
  type TrainingDay,
} from "../api/client";

const STARTER_PLANS: TrainingPlan[] = [
  {
    id: "starter-5k",
    name: "Beginner 5K",
    goal: "5K",
    weekCount: 6,
    createdAt: Date.now(),
    weeks: [
      {
        weekNumber: 1,
        weeklyDistance: 12,
        days: [
          { day: "Mon", type: "easy", description: "Easy jog, keep it conversational", targetDistance: 2, targetPace: 7.0 },
          { day: "Tue", type: "rest", description: "Rest or light stretching" },
          { day: "Wed", type: "easy", description: "Easy run with BunBot pacer", targetDistance: 2.5, targetPace: 6.8 },
          { day: "Thu", type: "cross-training", description: "30 min cycling or swimming" },
          { day: "Fri", type: "rest", description: "Rest day" },
          { day: "Sat", type: "long", description: "Longer easy effort", targetDistance: 3.5, targetPace: 7.2 },
          { day: "Sun", type: "rest", description: "Active recovery — walk" },
        ],
      },
      {
        weekNumber: 2,
        weeklyDistance: 14,
        days: [
          { day: "Mon", type: "easy", description: "Easy jog", targetDistance: 2.5, targetPace: 6.8 },
          { day: "Tue", type: "rest", description: "Rest" },
          { day: "Wed", type: "tempo", description: "Warm up 5 min, tempo 10 min, cool down 5 min", targetDistance: 3, targetPace: 6.0 },
          { day: "Thu", type: "cross-training", description: "Core & flexibility work" },
          { day: "Fri", type: "rest", description: "Rest day" },
          { day: "Sat", type: "long", description: "Long easy run", targetDistance: 4, targetPace: 7.0 },
          { day: "Sun", type: "rest", description: "Rest" },
        ],
      },
      {
        weekNumber: 3,
        weeklyDistance: 16,
        days: [
          { day: "Mon", type: "easy", description: "Recovery run", targetDistance: 3, targetPace: 7.0 },
          { day: "Tue", type: "rest", description: "Rest" },
          { day: "Wed", type: "interval", description: "5×400m at 5K pace with 90s jog recovery", targetDistance: 3.5, targetPace: 5.5 },
          { day: "Thu", type: "easy", description: "Easy shake-out", targetDistance: 2, targetPace: 7.2 },
          { day: "Fri", type: "rest", description: "Rest day" },
          { day: "Sat", type: "long", description: "Long run, negative split", targetDistance: 4.5, targetPace: 6.8 },
          { day: "Sun", type: "rest", description: "Rest" },
        ],
      },
      {
        weekNumber: 4,
        weeklyDistance: 18,
        days: [
          { day: "Mon", type: "easy", description: "Easy run", targetDistance: 3, targetPace: 6.8 },
          { day: "Tue", type: "tempo", description: "20 min steady tempo", targetDistance: 3.5, targetPace: 5.8 },
          { day: "Wed", type: "rest", description: "Rest" },
          { day: "Thu", type: "easy", description: "Easy pace with strides", targetDistance: 3, targetPace: 6.8 },
          { day: "Fri", type: "rest", description: "Rest day" },
          { day: "Sat", type: "long", description: "Longest run of the block", targetDistance: 5, targetPace: 6.8 },
          { day: "Sun", type: "rest", description: "Active recovery" },
        ],
      },
      {
        weekNumber: 5,
        weeklyDistance: 16,
        days: [
          { day: "Mon", type: "easy", description: "Easy run", targetDistance: 3, targetPace: 6.8 },
          { day: "Tue", type: "interval", description: "6×400m at 5K pace, 90s rest", targetDistance: 4, targetPace: 5.5 },
          { day: "Wed", type: "rest", description: "Rest" },
          { day: "Thu", type: "easy", description: "Easy jog", targetDistance: 2.5, targetPace: 7.0 },
          { day: "Fri", type: "rest", description: "Rest day" },
          { day: "Sat", type: "long", description: "Moderate long run", targetDistance: 4.5, targetPace: 6.5 },
          { day: "Sun", type: "rest", description: "Rest" },
        ],
      },
      {
        weekNumber: 6,
        weeklyDistance: 12,
        days: [
          { day: "Mon", type: "easy", description: "Short easy jog", targetDistance: 2, targetPace: 7.0 },
          { day: "Tue", type: "tempo", description: "Race-pace rehearsal", targetDistance: 3, targetPace: 5.8 },
          { day: "Wed", type: "rest", description: "Rest" },
          { day: "Thu", type: "easy", description: "Shakeout jog + strides", targetDistance: 2, targetPace: 7.0 },
          { day: "Fri", type: "rest", description: "Rest — race prep" },
          { day: "Sat", type: "long", description: "Race day — 5K!", targetDistance: 5, targetPace: 5.8 },
          { day: "Sun", type: "rest", description: "Celebrate!" },
        ],
      },
    ],
  },
  {
    id: "starter-10k",
    name: "10K Builder",
    goal: "10K",
    weekCount: 8,
    createdAt: Date.now() - 86400000,
    weeks: [
      {
        weekNumber: 1,
        weeklyDistance: 20,
        days: [
          { day: "Mon", type: "easy", description: "Easy run", targetDistance: 3, targetPace: 6.5 },
          { day: "Tue", type: "rest", description: "Rest" },
          { day: "Wed", type: "tempo", description: "15 min tempo effort", targetDistance: 4, targetPace: 5.8 },
          { day: "Thu", type: "easy", description: "Recovery jog", targetDistance: 3, targetPace: 7.0 },
          { day: "Fri", type: "rest", description: "Rest day" },
          { day: "Sat", type: "long", description: "Long easy run", targetDistance: 6, targetPace: 6.8 },
          { day: "Sun", type: "cross-training", description: "30 min light activity" },
        ],
      },
      {
        weekNumber: 2,
        weeklyDistance: 24,
        days: [
          { day: "Mon", type: "easy", description: "Easy run", targetDistance: 4, targetPace: 6.5 },
          { day: "Tue", type: "interval", description: "6×600m at 10K pace, 2 min rest", targetDistance: 5, targetPace: 5.3 },
          { day: "Wed", type: "rest", description: "Rest" },
          { day: "Thu", type: "easy", description: "Easy jog", targetDistance: 3, targetPace: 7.0 },
          { day: "Fri", type: "rest", description: "Rest day" },
          { day: "Sat", type: "long", description: "Progressive long run", targetDistance: 7, targetPace: 6.5 },
          { day: "Sun", type: "rest", description: "Rest" },
        ],
      },
    ],
  },
];

export default function TrainingPlans() {
  const [plans, setPlans] = useState<TrainingPlan[]>(STARTER_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [goal, setGoal] = useState("5K");
  const [currentPace, setCurrentPace] = useState(6);
  const [weeklyDistance, setWeeklyDistance] = useState(20);
  const [weeks, setWeeks] = useState(8);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getPlans()
      .then((fetched) => {
        if (fetched.length > 0) {
          setPlans((prev) => [
            ...prev.filter((p) => p.id.startsWith("starter-")),
            ...fetched,
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const buildLocalPlan = (): TrainingPlan => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const types: Array<TrainingDay["type"]> = [
      "easy", "rest", "tempo", "easy", "rest", "long", "rest",
    ];
    const planWeeks: TrainingWeek[] = [];
    for (let w = 1; w <= weeks; w++) {
      const ramp = Math.min(w / weeks + 0.5, 1);
      const dist = Math.round(weeklyDistance * ramp);
      const days: TrainingDay[] = dayNames.map((day, i) => {
        const type = types[i];
        const base: TrainingDay = { day, type, description: "" };
        if (type === "rest") {
          base.description = "Rest or light stretching";
        } else if (type === "easy") {
          base.description = "Easy conversational pace";
          base.targetDistance = Math.round(dist * 0.15 * 10) / 10;
          base.targetPace = currentPace;
        } else if (type === "tempo") {
          base.description = `${10 + w * 2} min steady tempo`;
          base.targetDistance = Math.round(dist * 0.18 * 10) / 10;
          base.targetPace = Math.round((currentPace - 0.5) * 10) / 10;
        } else if (type === "long") {
          base.description = "Long run at easy effort";
          base.targetDistance = Math.round(dist * 0.3 * 10) / 10;
          base.targetPace = Math.round((currentPace + 0.3) * 10) / 10;
        }
        return base;
      });
      planWeeks.push({ weekNumber: w, days, weeklyDistance: dist });
    }
    return {
      id: `local-${Date.now()}`,
      name: `${goal} Plan (${weeks}wk)`,
      goal,
      weekCount: weeks,
      weeks: planWeeks,
      createdAt: Date.now(),
    };
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const plan = await generatePlan({ goal, currentPace, weeklyDistance, weeks });
      setPlans((prev) => [...prev, plan]);
      setSelectedPlan(plan);
    } catch {
      // Backend unavailable — generate locally
      const plan = buildLocalPlan();
      setPlans((prev) => [...prev, plan]);
      setSelectedPlan(plan);
    } finally {
      setGenerating(false);
    }
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

  const typeClass: Record<string, string> = {
    easy: "type-easy",
    tempo: "type-tempo",
    interval: "type-interval",
    long: "type-long",
    rest: "type-rest",
    "cross-training": "type-cross",
  };

  return (
    <div className="page">
      <h1>Training Plans</h1>
      <p className="subtitle">Build a personalized plan to hit your goals</p>

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
            Current Pace
            <div className="range-value">{formatPace(currentPace)} /km</div>
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
            Weekly Distance
            <div className="range-value">{weeklyDistance} km</div>
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
            Duration
            <div className="range-value">{weeks} weeks</div>
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
        <button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate Plan"}
        </button>
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

      {plans.length === 0 && !selectedPlan && (
        <section className="card">
          <div className="empty-state">
            <p>No plans yet — generate your first one above.</p>
          </div>
        </section>
      )}

      {/* Plan detail */}
      {selectedPlan && (
        <section className="card">
          <div className="plan-header">
            <h2>{selectedPlan.name}</h2>
            <button className="small secondary" onClick={() => setSelectedPlan(null)}>
              Back to Plans
            </button>
          </div>
          {selectedPlan.weeks.map((week) => (
            <div key={week.weekNumber} className="week-block">
              <h3>
                Week {week.weekNumber}
                <span className="pill" style={{ marginLeft: "0.5rem" }}>{week.weeklyDistance} km</span>
              </h3>
              <div className="days-grid">
                {week.days.map((day) => (
                  <div
                    key={day.day}
                    className={`day-card ${typeClass[day.type] || ""}`}
                  >
                    <strong>{day.day}</strong>
                    <span className={`pill ${typeClass[day.type] || ""}`}>
                      {day.type}
                    </span>
                    <p>{day.description}</p>
                    {day.targetDistance && <span className="meta">{day.targetDistance} km</span>}
                    {day.targetPace && (
                      <span className="meta"> @ {formatPace(day.targetPace)} /km</span>
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
