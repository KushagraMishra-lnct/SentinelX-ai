from fastapi.middleware.cors import CORSMiddleware


from fastapi import FastAPI
from sqlalchemy import select

from backend.database import SessionLocal
from backend.models import Alert

app = FastAPI(
    title="SentinelX API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "SentinelX",
        "status": "online",
    }


@app.get("/alerts")
def get_alerts():
    db = SessionLocal()

    try:
        alerts = db.scalars(
            select(Alert)
            .order_by(Alert.created_at.desc())
        ).all()

        return [
            {
                "id": alert.id,
                "type": alert.alert_type,
                "severity": alert.severity,
                "ip": alert.ip,
                "message": alert.message,
                "created_at": alert.created_at,
            }
            for alert in alerts
        ]

    finally:
        db.close()

