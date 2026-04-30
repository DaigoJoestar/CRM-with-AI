import json
import uuid
from ..core.groq_client import client
from ..core.database import SessionLocal
from ..models.interaction import Interaction
from datetime import datetime, timezone
from langchain_core.messages import BaseMessage
from ..models import HCP

def log_interaction(state):
    messages = state.get("messages", [])
    user_text = ""
    if isinstance(messages, list) and messages:
        first_message = messages[0]
        if isinstance(first_message, BaseMessage):
            user_text = first_message.content
        elif isinstance(first_message, dict):
            user_text = first_message.get("content", "")
        else:
            user_text = str(first_message)

    current_date = datetime.now(timezone.utc).date().isoformat()
    prompt = f"""Extract from the following interaction text the following fields as JSON. CRITICAL COMPLIANCE GUIDELINES:
- Set compliance_check to FALSE only for high-risk violations: Quid-pro-quo (gifts/trips for scripts), off-label marketing, or personal financial guarantees.
- Set compliance_check to TRUE for standard business: Discussions about drug costs, insurance coverage, and Patient Assistance Programs (PAPs). These are LEGAL and HELPFUL. Be aggressive in identifying HCP names (look for Dr., physician, etc.), products (medications, devices), dates,\
        and sentiments. Fields: hcp_id (UUID string or null), hcp_name (string), interaction_date (ISO string), discussion_topics (array of strings like product names), sentiment (Positive/Neutral/Concerned)\
            , compliance_check (boolean), compliance_reasoning (string: explain WHY if compliance_check is false, else "None"), next_steps (string). Current date: {current_date}. When calculating relative dates like 'yesterday' or 'last week', use this current date as the reference point and output \
                them as ISO 8601 strings. Calculated dates must be relative to 2026. Never use training data dates like 2024. Return ONLY raw JSON. Do not include markdown formatting or triple backticks."""

    max_retries = 2
    for attempt in range(max_retries + 1):
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt + " Interaction: " + user_text}
            ],
        )

        raw_content = None
        if isinstance(response, dict):
            if response.get("choices"):
                try:
                    raw_content = response["choices"][0]["message"]["content"]
                except Exception:
                    pass
            if raw_content is None and response.get("output"):
                first_output = response["output"][0]
                if isinstance(first_output, dict) and first_output.get("content"):
                    raw_content = "".join(
                        chunk.get("text", "")
                        for chunk in first_output.get("content", [])
                        if isinstance(chunk, dict)
                    )
        if not raw_content:
            state["error"] = "No response from LLM"
            print("No response from LLM", response)
            return state
        raw_content = raw_content.strip()
        print(f"Raw LLM response (attempt {attempt + 1}): {raw_content}")
        # Clean markdown formatting
        if raw_content.startswith("```json"):
            raw_content = raw_content[7:]
        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]
        raw_content = raw_content.strip()
        try:
            extracted = json.loads(raw_content)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}. Raw response: {raw_content}")
            state["error"] = f"Failed to parse LLM response: {str(e)}"
            extracted = {
                "hcp_id": None,
                "hcp_name": "Unknown",
                "interaction_date": datetime.now(timezone.utc).isoformat(),
                "discussion_topics": [],
                "sentiment": "Neutral",
                "compliance_check": True,
                "next_steps": "Review interaction manually",
            }
            break  # Don't retry on JSON error

        # Check if interaction_date is from 2024, if so, retry with emphasis
        interaction_date_str = extracted.get("interaction_date", "")
        if interaction_date_str.startswith("2024") and attempt < max_retries:
            print(
                f"Detected 2024 date: {interaction_date_str}, retrying with emphasis on 2026"
            )
            prompt = f"Extract from the following interaction text the following fields as JSON. Be aggressive in identifying HCP names (look for Dr., physician, etc.), products (medications, devices), dates, and sentiments. Fields: hcp_id (UUID string or null), hcp_name (string), interaction_date (ISO string), discussion_topics (array of strings like product names), sentiment (Positive/Neutral/Concerned), compliance_check (boolean), next_steps (string). Current date: {current_date}. IMPORTANT: All dates must be in 2026 or later. Do not use 2024 dates. When calculating relative dates like 'yesterday' or 'last week', use 2026 as the current year and output them as ISO 8601 strings. Return ONLY raw JSON. Do not include markdown formatting or triple backticks."
            continue
        else:
            break  # Either valid date or max retries reached

    # Save to db
    print(f"Saving extracted interaction: {extracted}")
    db = SessionLocal()
    try:
        raw_date = extracted.get("interaction_date")
        try:
            if raw_date:
                normalized_date = raw_date.replace("Z", "+00:00")
                interaction_date = datetime.fromisoformat(normalized_date)
            else:
                interaction_date = datetime.now(timezone.utc)
        except ValueError:
            interaction_date = datetime.now(timezone.utc)

        hcp_name = extracted.get("hcp_name")
        hcp_id = None
        
        if hcp_name and hcp_name != "Unknown":
            # Search for existing HCP by name (case-insensitive)
            existing_hcp = db.query(HCP).filter(HCP.name.ilike(f"%{hcp_name}%")).first()
            
            if existing_hcp:
                hcp_id = existing_hcp.id
                print(f"🔗 Linked to existing HCP: {hcp_name} ({hcp_id})")
            else:
                # Create new HCP if not found
                new_hcp = HCP(name=hcp_name)
                db.add(new_hcp)
                db.commit()
                db.refresh(new_hcp)
                hcp_id = new_hcp.id
                print(f"👤 Created new HCP profile for: {hcp_name}")
        

        interaction = Interaction(
            hcp_id=hcp_id,
            hcp_name=extracted.get("hcp_name"),
            interaction_date=interaction_date,
            discussion_topics=extracted.get("discussion_topics", []),
            sentiment=extracted.get("sentiment"),
            compliance_check=extracted.get("compliance_check", True),
            next_steps=extracted.get("next_steps"),
        )
        db.add(interaction)
        db.commit()
        state["last_interaction_id"] = str(interaction.id)
        db.refresh(interaction)
        print(f"Successfully saved interaction to database with ID: {interaction.id}")
        extracted["id"] = str(interaction.id)
    except Exception as db_error:
        print(f"Database save error: {db_error}")
        db.rollback()
        state["error"] = f"Failed to save interaction: {str(db_error)}"
        state["interaction_data"] = extracted
        return state
    finally:
        db.close()

    state["interaction_data"] = extracted
    state["hcp_name"] = extracted.get("hcp_name", "")
    state["sentiment"] = extracted.get("sentiment", "Neutral")
    state["discussion_topics"] = extracted.get("discussion_topics", [])
    state["interaction_date"] = extracted.get("interaction_date", "")

    # This triggers the 'compliance_reducer' you just wrote!
    state["compliance_check"] = extracted.get("compliance_check", True)
    return state
