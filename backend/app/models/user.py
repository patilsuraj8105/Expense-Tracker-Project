import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    # Using sqlalchemy String to represent UUID if sqlite is used for testing, but let's use string for UUID to be compatible with sqlite fallback, or UUID directly if we assume postgres.
    # The prompt specified Supabase PostgreSQL, so we can use UUID.
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
