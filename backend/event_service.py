from backend.database import SessionLocal
from backend.event_model import Event


def save_event(event_data):
    db = SessionLocal()

    try:
        event = Event(
            source=event_data["source"],
            level=event_data["level"],
            ip=event_data["ip"],
            message=event_data["message"],
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        return event

    finally:
        db.close()
