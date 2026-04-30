from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..core.database import SessionLocal
from ..models.interaction import Interaction
from sqlalchemy.orm import Session

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/log")
def log_interaction(item: dict, db: Session = Depends(get_db)):
    interaction = Interaction(**item)
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction

@router.put("/edit/{interaction_id}")
def edit_interaction(interaction_id: str, changes: dict, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    for key, value in changes.items():
        if hasattr(interaction, key):
            setattr(interaction, key, value)
    db.commit()
    db.refresh(interaction)
    return interaction

@router.get("/{interaction_id}")
def get_interaction(interaction_id: str, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction
