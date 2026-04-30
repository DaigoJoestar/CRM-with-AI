from langgraph.graph import StateGraph, END
from .state import AgentState
from ..tools import log_interaction, edit_interaction, compliance_validator, medical_context_provider, nba_suggester
from ..core.groq_client import client

def call_model(state: AgentState):
    state["compliance_check"] = True 
    state["compliance_violations"] = []
    messages = state.get("messages", [])
    user_text = ""
    if isinstance(messages, list) and messages:
        first_message = messages[0]
        if isinstance(first_message, dict):
            user_text = first_message.get("content", "")
        else:
            user_text = str(first_message)

    # Enhanced action detection with multiple tool support
    prompt = f"""Analyze this message and determine the primary action. Available actions:
- "log": Log a new interaction from natural language description
- "edit": Change details of an existing interaction
- "validate": Check compliance of interaction content
- "context": Get medical insights for technical questions
- "nba": Get next best action recommendations

Message: "{user_text}"

Look for:
- Edit/change keywords: "change", "update", "modify", "correct", "fix"
- Compliance keywords: "check compliance", "validate", "audit"
- Medical questions: "how does", "what about", "efficacy", "safety", "dosage"
- NBA requests: "what next", "next steps", "recommendation", "suggestion"

Return only one action: log, edit, validate, context, or nba."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        action = response.get("choices", [{}])[0].get("message", {}).get("content", "").strip().lower()
        valid_actions = ["log", "edit", "validate", "context", "nba"]
        state["current_action"] = action if action in valid_actions else "log"
    except Exception as e:
        print(f"Action detection error: {e}")
        state["current_action"] = "log"

    return state

def router(state: AgentState) -> str:
    action = state.get("current_action", "log")
    if action == "log":
        return "log_interaction"
    elif action == "edit":
        return "edit_interaction"
    elif action == "validate":
        return "compliance_validator"
    elif action == "context":
        return "medical_context_provider"
    elif action == "nba":
        return "nba_suggester"
    else:
        return END

def post_log_processor(state: AgentState) -> str:
    """After logging, automatically run compliance check and NBA suggestion"""
    # Always run compliance check after logging
    if state.get("current_action") == "log":
        return "compliance_validator"
    return END

def post_compliance_processor(state: AgentState) -> str:
    """After compliance check, run NBA suggester"""
    if state.get("compliance_check") is not None:
        return "nba_suggester"
    return END

graph = StateGraph(AgentState)
graph.add_node("agent", call_model)
graph.add_node("log_interaction", log_interaction)
graph.add_node("edit_interaction", edit_interaction)
graph.add_node("compliance_validator", compliance_validator)
graph.add_node("medical_context_provider", medical_context_provider)
graph.add_node("nba_suggester", nba_suggester)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", router, {
    "log_interaction": "log_interaction",
    "edit_interaction": "edit_interaction",
    "compliance_validator": "compliance_validator",
    "medical_context_provider": "medical_context_provider",
    "nba_suggester": "nba_suggester"
})
# Automatic chaining: log -> compliance check -> NBA suggestion
graph.add_conditional_edges("log_interaction", post_log_processor, {
    "compliance_validator": "compliance_validator"
})
graph.add_conditional_edges("compliance_validator", post_compliance_processor, {
    "nba_suggester": "nba_suggester"
})
# Other tools go directly to END
graph.add_edge("edit_interaction", END)
graph.add_edge("medical_context_provider", END)
graph.add_edge("nba_suggester", END)

hcp_agent = graph.compile()