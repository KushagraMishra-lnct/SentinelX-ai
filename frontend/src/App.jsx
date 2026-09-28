import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CircleDot,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [severity, setSeverity] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadAlerts() {
    try {
      setLoading(true);

      const response = await fetch(`${API}/alerts`);

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      setAlerts(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Unable to load alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity =
        severity === "ALL" || alert.severity === severity;

      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        alert.type?.toLowerCase().includes(searchText) ||
        alert.ip?.toLowerCase().includes(searchText) ||
        alert.message?.toLowerCase().includes(searchText);

      return matchesSeverity && matchesSearch;
    });
  }, [alerts, severity, search]);

  const high = alerts.filter(
    (alert) => alert.severity === "HIGH"
  ).length;

  const critical = alerts.filter(
    (alert) => alert.severity === "CRITICAL"
  ).length;

  const uniqueIPs = new Set(
    alerts.map((alert) => alert.ip)
  ).size;

  return (
    <div className="app">

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Shield size={25} />
          </div>

          <div>
            <h1>SentinelX</h1>
            <p>Security Operations Center</p>
          </div>
        </div>

        <div className="system-status">
          <CircleDot size={13} />
          SYSTEM ONLINE
        </div>
      </header>

      <div className="layout">

        <aside className="sidebar">

          <div className="nav-section">
            <span>MONITORING</span>

            <button className="nav-item active">
              <Activity size={18} />
              Dashboard
            </button>

            <button className="nav-item">
              <Bell size={18} />
              Alerts
              <span className="nav-count">{alerts.length}</span>
            </button>

            <button className="nav-item">
              <Terminal size={18} />
              Events
            </button>
          </div>

          <div className="sidebar-bottom">
            <div className="engine-status">
              <div className="engine-dot"></div>
              <div>
                <strong>Detection Engine</strong>
                <span>Operational</span>
              </div>
            </div>
          </div>

        </aside>

        <main className="main">

          <div className="page-heading">
            <div>
              <h2>Security Dashboard</h2>
              <p>Real-time overview of detected security events.</p>
            </div>

            <button
              className="refresh-button"
              onClick={loadAlerts}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "spin" : ""}
              />
              Refresh
            </button>
          </div>

          <section className="stats">

            <StatCard
              icon={<Activity />}
              label="Total Alerts"
              value={alerts.length}
            />

            <StatCard
              icon={<AlertTriangle />}
              label="High Severity"
              value={high}
            />

            <StatCard
              icon={<ShieldAlert />}
              label="Critical"
              value={critical}
            />

            <StatCard
              icon={<Shield />}
              label="Source IPs"
              value={uniqueIPs}
            />

          </section>

          <section className="panel">

            <div className="panel-heading">

              <div>
                <h3>Security Alerts</h3>
                <p>
                  Threats detected by the SentinelX detection engine
                </p>
              </div>

              <div className="updated">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : "Waiting for data"}
              </div>

            </div>

            <div className="toolbar">

              <div className="search">
                <Search size={17} />
                <input
                  placeholder="Search alerts, IPs or attack types..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="filters">

                {["ALL", "HIGH", "CRITICAL"].map((level) => (
                  <button
                    key={level}
                    className={
                      severity === level
                        ? "filter active-filter"
                        : "filter"
                    }
                    onClick={() => setSeverity(level)}
                  >
                    {level}
                  </button>
                ))}

              </div>

            </div>

            <div className="alert-table">

              <div className="table-header">
                <span>THREAT</span>
                <span>SOURCE</span>
                <span>SEVERITY</span>
                <span>TIME</span>
              </div>

              {filteredAlerts.length === 0 ? (

                <div className="empty">
                  <Shield size={30} />
                  <strong>No alerts found</strong>
                  <span>
                    No security events match your current filters.
                  </span>
                </div>

              ) : (

                filteredAlerts.map((alert) => (

                  <div className="alert-row" key={alert.id}>

                    <div className="threat">

                      <div className="threat-icon">
                        <ShieldAlert size={18} />
                      </div>

                      <div>
                        <strong>{alert.type}</strong>
                        <span>{alert.message}</span>
                      </div>

                    </div>

                    <div className="ip">
                      {alert.ip}
                    </div>

                    <div>
                      <span
                        className={`severity ${alert.severity.toLowerCase()}`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <div className="time">
                      {new Date(
                        alert.created_at
                      ).toLocaleTimeString()}
                    </div>

                  </div>

                ))

              )}

            </div>

          </section>

        </main>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

export default App;