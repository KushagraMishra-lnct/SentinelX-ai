from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    source: Mapped[str] = mapped_column(String(50))
    level: Mapped[str] = mapped_column(String(20))
    ip: Mapped[str] = mapped_column(String(45))
    message: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
