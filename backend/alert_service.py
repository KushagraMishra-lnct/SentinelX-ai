from backend.database import SessionLocal
from backend.models import Alert


def save_alert(alert_data):
    db = SessionLocal()

    try:
        alert = Alert(
            alert_type=alert_data["type"],
            severity=alert_data["severity"],
            ip=alert_data["ip"],
            message=alert_data["message"],
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        return alert

    finally:
        db.close()

