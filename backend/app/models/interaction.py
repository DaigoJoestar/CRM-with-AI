from sqlalchemy import Column, String, DateTime, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid

class HCP(Base):
    __tablename__ = "hcps"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    specialty = Column(String)

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hcp_id = Column(UUID(as_uuid=True))
    hcp_name = Column(String)
    interaction_date = Column(DateTime)
    discussion_topics = Column(ARRAY(String))
    sentiment = Column(String)
    compliance_check = Column(Boolean)
    next_steps = Column(String)

class FollowUp(Base):
    __tablename__ = "followups"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interaction_id = Column(UUID(as_uuid=True))
    date = Column(DateTime)
    notes = Column(String)