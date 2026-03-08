import { useState, useEffect } from "react";
import {
  connectArduino,
  disconnectArduino,
  listPorts,
  emergencyStop,
} from "../api/client";
import { useStrollerSocket } from "../hooks/useStrollerSocket";

export default function StrollerControl() {
  const { data, connected: wsConnected, sendSpeed, sendStop } =
    useStrollerSocket();
  const [ports, setPorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [arduinoConnected, setArduinoConnected] = useState(false);
  const [targetSpeed, setTargetSpeed] = useState(1.5);
  const [error, setError] = useState("");

  useEffect(() => {
    listPorts().then((r) => {
      setPorts(r.ports);
      if (r.ports.length > 0) setSelectedPort(r.ports[0]);
    });
  }, []);

  const handleConnect = async () => {
    setError("");
    const result = await connectArduino(selectedPort);
    if (result.success) {
      setArduinoConnected(true);
    } else {
      setError(result.error || "Connection failed");
    }
  };

  const handleDisconnect = async () => {
    await disconnectArduino();
    setArduinoConnected(false);
  };

  const handleStop = () => {
    sendStop();
    emergencyStop();
  };

  return (
    <div className="page">
      <h1>🎮 Stroller Control</h1>

      {/* Connection */}
      <section className="card">
        <h2>Arduino Connection</h2>
        {!arduinoConnected ? (
          <div className="form-row">
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
            >
              {ports.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button onClick={handleConnect}>Connect</button>
          </div>
        ) : (
          <div className="form-row">
            <span className="status connected">Connected to {selectedPort}</span>
            <button className="secondary" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      {/* Speed Control */}
      <section className="card">
        <h2>Speed Control</h2>
        <div className="speed-control">
          <label>
            Target Speed: <strong>{targetSpeed.toFixed(1)} m/s</strong>
            <span className="pace-hint">
              ({((1000 / targetSpeed) / 60).toFixed(1)} min/km)
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={targetSpeed}
            onChange={(e) => setTargetSpeed(Number(e.target.value))}
          />
          <div className="form-row">
            <button onClick={() => sendSpeed(targetSpeed)}>Set Speed</button>
            <button className="danger" onClick={handleStop}>
              🛑 Emergency Stop
            </button>
          </div>
        </div>
      </section>

      {/* Live Data */}
      <section className="card">
        <h2>Live Data {wsConnected ? "🟢" : "🔴"}</h2>
        {data ? (
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">{data.speed.toFixed(2)}</span>
              <span className="stat-label">m/s</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(data.distance / 1000).toFixed(2)}</span>
              <span className="stat-label">km</span>
            </div>
            <div className="stat">
              <span className="stat-value">{data.batteryLevel}%</span>
              <span className="stat-label">Battery</span>
            </div>
            <div className="stat">
              <span className="stat-value">{data.motorStatus}</span>
              <span className="stat-label">Motor</span>
            </div>
          </div>
        ) : (
          <p>No data yet — connect Arduino and start moving.</p>
        )}
      </section>
    </div>
  );
}
