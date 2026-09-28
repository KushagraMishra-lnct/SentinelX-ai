from backend.database import SessionLocal
from backend.models import Alert
from detector.risk_engine import calculate_risk


def save_alert(alert_data):
    db = SessionLocal()

    try:
        risk = calculate_risk(alert_data)

        alert = Alert(
            alert_type=alert_data["type"],
            severity=alert_data["severity"],
            ip=alert_data["ip"],
            message=alert_data["message"],
            risk_score=risk["score"],
            risk_level=risk["risk_level"],
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        return alert

    finally:
        db.close()
