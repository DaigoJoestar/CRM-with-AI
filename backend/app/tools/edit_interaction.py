import json
from datetime import datetime, timezone
from ..core.groq_client import client
from ..core.database import SessionLocal
from ..models.interaction import Interaction


def parse_date_value(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                try:
                    return datetime.strptime(value, "%Y-%m-%d")
                except ValueError:
                    return datetime.now(timezone.utc)
    return datetime.now(timezone.utc)


def edit_interaction(state):
    messages = state.get("messages", [])
    user_text = ""
    if isinstance(messages, list) and messages:
        first_message = messages[0]
        if isinstance(first_message, dict):
            user_text = first_message.get("content", "")
        else:
            user_text = str(first_message)

    # First, find the most recent interaction to edit
    db = SessionLocal()
    try:
        interaction_id = state.get("last_interaction_id") # Ensure your log_node sets this!
        if not interaction_id:
    # Fallback to recent only if absolutely necessary, but ID is safer
            recent_interaction = db.query(Interaction).order_by(Interaction.interaction_date.desc()).first()
        else:
            recent_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not recent_interaction:
            state["error"] = "No interactions found to edit"
            return state

        # Use AI to parse the change request
        prompt = f"""Parse this change request for the interaction with {recent_interaction.hcp_name} from {recent_interaction.interaction_date.isoformat() if recent_interaction.interaction_date else 'unknown date'}.

Current interaction data:
- HCP Name: {recent_interaction.hcp_name}
- Discussion Topics: {', '.join(recent_interaction.discussion_topics) if recent_interaction.discussion_topics else 'None'}
- Sentiment: {recent_interaction.sentiment}
- Next Steps: {recent_interaction.next_steps}
- Compliance Check: {recent_interaction.compliance_check}

Change request: "{user_text}"

Extract what needs to be changed as JSON with these fields:
- field_to_change: (hcp_name, discussion_topics, sentiment, next_steps, compliance_check)
- new_value: the new value for that field
- action_description: brief description of the change made

Return ONLY raw JSON. No markdown formatting."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )

        raw_content = response.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if raw_content.startswith('```json'):
            raw_content = raw_content[7:]
        if raw_content.endswith('```'):
            raw_content = raw_content[:-3]
        raw_content = raw_content.strip()

        try:
            change_data = json.loads(raw_content)
        except json.JSONDecodeError:
            state["error"] = "Failed to parse change request"
            return state

        field = change_data.get("field_to_change")
        new_value = change_data.get("new_value")
        action_desc = change_data.get("action_description", f"Updated {field}")

        # Apply the change
        ALLOWED_FIELDS = {'hcp_name', 'discussion_topics', 'sentiment', 'next_steps', 'compliance_check', 'interaction_date'}
        if field in ALLOWED_FIELDS and hasattr(recent_interaction, field):
            if field == "discussion_topics" and isinstance(new_value, str):
                new_value = [topic.strip() for topic in new_value.split(',')]
            if field == "interaction_date":
                if not new_value:
                    new_value = datetime.now(timezone.utc)
                else:
                    new_value = parse_date_value(new_value)
            setattr(recent_interaction, field, new_value)
            db.commit()

            state["interaction_data"] = {
                "id": recent_interaction.id,
                "hcp_name": recent_interaction.hcp_name,
                "interaction_date": recent_interaction.interaction_date.isoformat() if recent_interaction.interaction_date else None,
                "discussion_topics": recent_interaction.discussion_topics,
                "sentiment": recent_interaction.sentiment,
                "compliance_check": recent_interaction.compliance_check,
                "next_steps": recent_interaction.next_steps
            }
            state["action_performed"] = action_desc
        else:
            state["error"] = f"Invalid field: {field}"

    except Exception as e:
        state["error"] = f"Edit failed: {str(e)}"
    finally:
        db.close()

    return state