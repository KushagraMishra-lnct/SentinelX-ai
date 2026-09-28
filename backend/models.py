from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    alert_type: Mapped[str] = mapped_column(String(50))
    severity: Mapped[str] = mapped_column(String(20))
    ip: Mapped[str] = mapped_column(String(45))
    message: Mapped[str] = mapped_column(Text)

    risk_score: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    risk_level: Mapped[str] = mapped_column(
        String(20),
        default="LOW",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
