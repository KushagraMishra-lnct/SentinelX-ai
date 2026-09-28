import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Server,
  RefreshCw,
} from "lucide-react";
import "./App.css";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/alerts");
      const data = await response.json();

      setAlerts(data);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const critical = alerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;

  const high = alerts.filter(
    (alert) => alert.severity === "HIGH"
  ).length;

  return (
    <div className="app">
      <header>
        <div className="brand">
          <ShieldAlert size={32} />
          <div>
            <h1>SentinelX</h1>
            <p>Security Monitoring Platform</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>

      <main>
        <section className="stats">
          <div className="card">
            <Activity />
            <div>
              <span>Total Events</span>
              <strong>{alerts.length}</strong>
            </div>
          </div>

          <div className="card">
            <AlertTriangle />
            <div>
              <span>High Alerts</span>
              <strong>{high}</strong>
            </div>
          </div>

          <div className="card">
            <ShieldAlert />
            <div>
              <span>Critical Alerts</span>
              <strong>{critical}</strong>
            </div>
          </div>

          <div className="card">
            <Server />
            <div>
              <span>System</span>
              <strong>ONLINE</strong>
            </div>
          </div>
        </section>

        <section className="alerts-panel">
          <div className="panel-header">
            <div>
              <h2>Security Alerts</h2>
              <p>Detected threats from SentinelX detection engine</p>
            </div>

            <button onClick={loadAlerts}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="empty">No security alerts detected.</div>
          ) : (
            <div className="alert-list">
              {alerts.map((alert) => (
                <div className="alert" key={alert.id}>
                  <div className="alert-icon">
                    <ShieldAlert size={20} />
                  </div>

                  <div className="alert-info">
                    <strong>{alert.type}</strong>
                    <span>{alert.message}</span>
                    <small>
                      IP: {alert.ip} ·{" "}
                      {new Date(alert.created_at).toLocaleString()}
                    </small>
                  </div>

                  <div className={`severity ${alert.severity.toLowerCase()}`}>
                    {alert.severity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

