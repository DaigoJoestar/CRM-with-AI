from typing import TypedDict, List, Any, Optional, Sequence, Annotated
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages

def compliance_reducer(current: bool, update: bool) -> bool:
    """AND logic: once False, stays False. Only True if all updates are True."""
    return current and update

class AgentState(BaseModel):
    current_action: str = ""
    messages: Annotated[Sequence[BaseMessage], add_messages] = Field(default_factory=list)
    hcp_id: str = ""
    hcp_name: str = ""
    interaction_date: str = ""
    discussion_topics: List[str] = Field(default_factory=list)
    sentiment: str = ""
    compliance_check: Annotated[bool, compliance_reducer] = True
    compliance_violations: List[str] = Field(default_factory=list)
    next_steps: str = ""
    nba_recommendation: str = ""
    notes: str = ""
    interaction_data: Any = None
    medical_context: Any = None
    last_interaction_id: Optional[str] = None
    error: Optional[str] = None
    action_performed: Optional[str] = None

    def get(self, key, default=None):
        return getattr(self, key, default)

    def __getitem__(self, key):
        return getattr(self, key)

    def __setitem__(self, key, value):
        setattr(self, key, value)

