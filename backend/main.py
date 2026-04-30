from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.interactions import router as interactions_router
from app.api.agent import router as agent_router
from app.core.database import engine, Base
# from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HCP CRM AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(interactions_router, prefix="/api/interactions", tags=["interactions"])
app.include_router(agent_router, prefix="/api/chat", tags=["chat"])

@app.get("/")
def root():
    return {"status": "hcp-crm-ai backend running"}
