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
  const [page, setPage] = useState("dashboard");
  const [alerts, setAlerts] = useState([]);
  const [events, setEvents] = useState([]);
  const [severity, setSeverity] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const [alertsResponse, eventsResponse] = await Promise.all([
        fetch(`${API}/alerts`),
        fetch(`${API}/events`),
      ]);

      setAlerts(await alertsResponse.json());
      setEvents(await eventsResponse.json());
    } catch (error) {
      console.error("Failed to load SentinelX data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity =
        severity === "ALL" || alert.risk_level === severity;

      const text = search.toLowerCase();

      return (
        matchesSeverity &&
        (!search ||
          alert.type?.toLowerCase().includes(text) ||
          alert.ip?.toLowerCase().includes(text) ||
          alert.message?.toLowerCase().includes(text))
      );
    });
  }, [alerts, severity, search]);

  const filteredEvents = useMemo(() => {
    const text = search.toLowerCase();

    return events.filter(
      (event) =>
        !search ||
        event.source?.toLowerCase().includes(text) ||
        event.level?.toLowerCase().includes(text) ||
        event.ip?.toLowerCase().includes(text) ||
        event.message?.toLowerCase().includes(text)
    );
  }, [events, search]);

  const high = alerts.filter((a) => a.risk_level === "HIGH").length;
  const critical = alerts.filter(
    (a) => a.risk_level === "CRITICAL"
  ).length;




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

            <button
              className={`nav-item ${
                page === "dashboard" ? "active" : ""
              }`}
              onClick={() => setPage("dashboard")}
            >
              <Activity size={18} />
              Dashboard
            </button>

            <button
              className={`nav-item ${
                page === "alerts" ? "active" : ""
              }`}
              onClick={() => setPage("alerts")}
            >
              <Bell size={18} />
              Alerts
              <span className="nav-count">{alerts.length}</span>
            </button>

            <button
              className={`nav-item ${
                page === "events" ? "active" : ""
              }`}
              onClick={() => setPage("events")}
            >
              <Terminal size={18} />
              Events
              <span className="nav-count">{events.length}</span>
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
          {page === "dashboard" && (
            <Dashboard
              alerts={alerts}
              events={events}
              high={high}
              critical={critical}
              setPage={setPage}
              loadData={loadData}
              loading={loading}
            />
          )}

          {page === "alerts" && (
            <AlertsPage
              alerts={filteredAlerts}
              severity={severity}
              setSeverity={setSeverity}
              search={search}
              setSearch={setSearch}
              loadData={loadData}
              loading={loading}
            />
          )}

          {page === "events" && (
            <EventsPage
              events={filteredEvents}
              search={search}
              setSearch={setSearch}
              loadData={loadData}
              loading={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Dashboard({
  alerts,
  events,
  high,
  critical,
  setPage,
  loadData,
  loading,
}) {
  const uniqueIPs = new Set(alerts.map((a) => a.ip)).size;

  const attackCounts = alerts.reduce((counts, alert) => {
    counts[alert.type] = (counts[alert.type] || 0) + 1;
    return counts;
  }, {});

  const topAttack = Object.entries(attackCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Security Dashboard</h2>
          <p>Real-time overview of SentinelX activity.</p>
        </div>

        <RefreshButton
          onClick={loadData}
          loading={loading}
        />
      </div>

      <section className="stats">
        <StatCard
          icon={<Activity />}
          label="Total Events"
          value={events.length}
        />

        <StatCard
          icon={<AlertTriangle />}
          label="High Alerts"
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

        <StatCard
          icon={<ShieldAlert />}
          label="Top Attack"
          value={topAttack ? `${topAttack[0]} (${topAttack[1]})` : "None"}
        />


      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Security Alerts</h3>
            <p>Latest threats detected by SentinelX.</p>
          </div>

          <button
            className="text-button"
            onClick={() => setPage("alerts")}
          >
            View all
          </button>
        </div>

        {alerts.slice(0, 5).map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </section>
    </>
  );
}

function AlertsPage({
  alerts,
  severity,
  setSeverity,
  search,
  setSearch,
  loadData,
  loading,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Security Alerts</h2>
          <p>Detected threats and security violations.</p>
        </div>

        <RefreshButton
          onClick={loadData}
          loading={loading}
        />
      </div>

      <section className="panel">
        <Toolbar
          search={search}
          setSearch={setSearch}
          severity={severity}
          setSeverity={setSeverity}
        />

        {alerts.length === 0 ? (
          <Empty />
        ) : (
          alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))
        )}
      </section>
    </>
  );
}

function EventsPage({
  events,
  search,
  setSearch,
  loadData,
  loading,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Security Events</h2>
          <p>Raw events collected from monitored sources.</p>
        </div>

        <RefreshButton
          onClick={loadData}
          loading={loading}
        />
      </div>

      <section className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />

            <input
              placeholder="Search events, IPs or messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="event-header">
          <span>SOURCE</span>
          <span>LEVEL</span>
          <span>SOURCE IP</span>
          <span>MESSAGE</span>
          <span>TIME</span>
        </div>

        {events.length === 0 ? (
          <Empty />
        ) : (
          events.map((event) => (
            <div className="event-row" key={event.id}>
              <span>{event.source}</span>

              <span className={`level ${event.level.toLowerCase()}`}>
                {event.level}
              </span>

              <span className="ip">{event.ip}</span>

              <span className="event-message">
                {event.message}
              </span>

              <span className="time">
                {new Date(
                  event.created_at
                ).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </section>
    </>
  );
}

function Toolbar({
  search,
  setSearch,
  severity,
  setSeverity,
}) {
  return (
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
        {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level) => (
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
  );
}

function AlertRow({ alert }) {
  return (
    <div className="alert-row">
      <div className="threat">
        <div className="threat-icon">
          <ShieldAlert size={18} />
        </div>

        <div>
          <strong>{alert.type}</strong>
          <span>{alert.message}</span>
        </div>
      </div>

      <div className="ip">{alert.ip}</div>


<div className="risk-cell">
  <span
    className={`severity ${alert.risk_level.toLowerCase()}`}
  >
    Risk: {alert.risk_level}
  </span>

  <span className="risk-score">
    Final Risk: {alert.risk_score}/100
  </span>

  <span
    className={`anomaly-level ${alert.anomaly_level.toLowerCase()}`}
  >
    Anomaly: {alert.anomaly_level}
  </span>

  <span className="anomaly-score">
    Anomaly Score: {alert.anomaly_score}/100
  </span>
</div>


{alert.ml_score > 0 ? (
  <>
    <span className={`ml-prediction ${alert.ml_prediction?.toLowerCase()}`}>
      ML: {alert.ml_prediction}
    </span>

    <span className="ml-score">
      ML Score: {alert.ml_score}/100
    </span>

    <div className="response-info">
      <span className="response-status">
        Response: {alert.response_status}
      </span>

      <span className="response-action">
        Action: {alert.response_action}
      </span>
    </div>

 </>
) : (
  <span className="ml-prediction">
    ML: NOT ANALYZED
  </span>
)}





      <div className="time">
        {new Date(alert.created_at).toLocaleTimeString()}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function RefreshButton({ onClick, loading }) {
  return (
    <button className="refresh-button" onClick={onClick}>
      <RefreshCw
        size={16}
        className={loading ? "spin" : ""}
      />
      Refresh
    </button>
  );
}

function Empty() {
  return (
    <div className="empty">
      <Shield size={30} />
      <strong>No events found</strong>
      <span>No data matches the current filters.</span>
    </div>
  );
}

export default App;
