import { useState, useEffect } from "react";
import {
  connectArduino,
  disconnectArduino,
  listPorts,
  emergencyStop,
  setStrollerSpeed,
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

  const handleSetSpeed = async () => {
    sendSpeed(targetSpeed);
    try {
      await setStrollerSpeed(targetSpeed);
    } catch {
      // WebSocket already sent the command
    }
  };

  const handleStop = () => {
    sendStop();
    emergencyStop();
  };

  return (
    <div className="page">
      <h1>Pacer Control</h1>
      <p className="subtitle">Connect to BunBot and set your target pace</p>

      {/* Connection */}
      <section className="card">
        <h2>Arduino Connection</h2>
        {!arduinoConnected ? (
          <div className="form-row">
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
            >
              {ports.length === 0 && <option>No ports found</option>}
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
        <h2>Pace Control</h2>
        <div className="speed-control">
          <div className="speed-display">
            {((1000 / targetSpeed) / 60).toFixed(1)}
            <span className="speed-unit"> min/km</span>
          </div>
          <span className="pace-hint">
            {targetSpeed.toFixed(1)} m/s
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={targetSpeed}
            onChange={(e) => setTargetSpeed(Number(e.target.value))}
          />
          <div className="form-row" style={{ justifyContent: "center", marginTop: "0.75rem" }}>
            <button onClick={handleSetSpeed} disabled={!arduinoConnected}>
              Set Speed
            </button>
            <button className="danger" onClick={handleStop} disabled={!arduinoConnected}>
              Emergency Stop
            </button>
          </div>
        </div>
      </section>

      {/* Live Data */}
      <section className="card">
        <h2>
          Live Telemetry{" "}
          <span className={`status ${wsConnected ? "connected" : "disconnected"}`}>
            {wsConnected ? "Live" : "Offline"}
          </span>
        </h2>
        {data ? (
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">{data.speed.toFixed(2)}</span>
              <span className="stat-label">Speed m/s</span>
            </div>
            <div className="stat">
              <span className="stat-value">{(data.distance / 1000).toFixed(2)}</span>
              <span className="stat-label">Distance km</span>
            </div>
            <div className="stat">
              <span className="stat-value">{data.batteryLevel}%</span>
              <span className="stat-label">Battery</span>
            </div>
            <div className="stat">
              <span className="stat-value" style={{ fontSize: "1.2rem" }}>{data.motorStatus}</span>
              <span className="stat-label">Motor</span>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Connect to BunBot to see live pace and distance data.</p>
          </div>
        )}
      </section>
    </div>
  );
}
