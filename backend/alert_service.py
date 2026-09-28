from backend.database import SessionLocal
from backend.models import Alert
from detector.risk_engine import calculate_risk
from detector.anomaly_detector import (
    calculate_ip_anomaly_score,
    get_anomaly_level,
)


def save_alert(alert_data, all_events=None):
    db = SessionLocal()

    try:
        if all_events is None:
            all_events = []

        # Analyze the complete event stream
        anomaly_score = calculate_ip_anomaly_score(
            all_events,
            alert_data["ip"],
        )

        anomaly_level = get_anomaly_level(anomaly_score)

        # Rule-based risk
        risk = calculate_risk(alert_data)

        # Combine rule risk + anomaly risk
        final_score = round(
            (risk["score"] * 0.7)
            + (anomaly_score * 0.3)
        )

        final_score = min(final_score, 100)

        if final_score >= 90:
            final_level = "CRITICAL"
        elif final_score >= 70:
            final_level = "HIGH"
        elif final_score >= 40:
            final_level = "MEDIUM"
        else:
            final_level = "LOW"

        alert = Alert(
            alert_type=alert_data["type"],
            severity=alert_data["severity"],
            ip=alert_data["ip"],
            message=alert_data["message"],
            risk_score=final_score,
            risk_level=final_level,
            anomaly_score=anomaly_score,
            anomaly_level=anomaly_level,
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        return alert

    finally:
        db.close()

