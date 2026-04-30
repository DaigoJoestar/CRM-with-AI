from fastapi import APIRouter
from ..agents.hcp_agent import hcp_agent
from langchain_core.messages import HumanMessage

router = APIRouter(redirect_slashes=False)


@router.options("/message")
@router.options("/message/")
def chat_options():
    return {"status": "ok"}


@router.post("/message")
@router.post("/message/")
def chat_message(payload: dict):
    print(f"Received chat payload: {payload}")
    message = payload.get("message")
    if not message:
        messages = payload.get("messages", [])
        if isinstance(messages, list) and messages:
            first = messages[0]
            if isinstance(first, str):
                message = first
            elif isinstance(first, dict):
                message = first.get("content", "")
            else:
                message = ""
    state = payload.get("state", {})
    state["messages"] = [HumanMessage(content=message)]
    state["compliance_check"] = True 
    state["compliance_violations"] = []

    try:
        result = hcp_agent.invoke(state)
        if isinstance(result, dict) and "interaction_data" in result:
             result["compliance_check"] = result["interaction_data"].get("compliance_check", True)
    except Exception as exc:
        print(f"Agent invocation error: {exc}")
        return {"response": "Agent error", "error": str(exc), "state": state}

    print(f"Agent result: {result}")
    response_text = "Processed"
    if result.get("action_performed"):
        response_text = f"Action completed: {result['action_performed']}"
    elif result.get("error"):
        response_text = f"Error: {result['error']}"

    return {
        "response": result.get(
            "nba_recommendation", response_text
        ),  # Use the NBA text as the main message
        "interaction_data": result.get("interaction_data", {}),
        "tools_executed": {
            "hcp_sync": bool(result.get("hcp_id")),
            "compliance_cleared": result.get("compliance_check"),
            "task_created": "schedule" in result.get("nba_recommendation", "").lower(),
        },
        "state": result,
    }
