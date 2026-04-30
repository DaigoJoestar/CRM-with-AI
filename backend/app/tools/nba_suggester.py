from ..core.groq_client import client
from ..core.database import SessionLocal
from ..models.interaction import Interaction
from ..models import FollowUp
from datetime import datetime, timedelta

def nba_suggester(state):
    """
    Next-Best-Action (NBA) Suggester: Analyzes sentiment and discussion_topics
    to suggest optimal next sales actions based on historical patterns.
    """
    
    interaction_data = state.get("interaction_data", {})
    
    # Prioritize values extracted by the AI, then fallback to global state
    sentiment = interaction_data.get("sentiment", state.get("sentiment", "Neutral"))
    topics = state.get("discussion_topics", [])
    hcp_name = interaction_data.get("hcp_name", state.get("hcp_name", "the physician"))
    compliance_check = state.get("compliance_check", True)

    
    # 2. Identify the specific ID for this interaction
    # This ensures we don't update a random 'first' record in the DB
    interaction_id = interaction_data.get("id")

    # 3. Compliance Logic (The absolute priority)
    is_compliant = interaction_data.get("compliance_check", True)
    recommended_action = None

    if is_compliant is False:
        recommended_action = "Immediately review all materials with compliance officer before any further communication. Schedule compliance training for the sales team."
    else:
        nba_patterns = {
                "Concerned_pricing": {
                    "trigger": lambda s, t: s == "Concerned" and any("pricing" in topic.lower() or "cost" in topic.lower() for topic in t),
                    "action": "Send the Tier 3 pricing schedule and schedule a follow-up call with the clinic manager to discuss reimbursement options."
                },
                "Concerned_efficacy": {
                    "trigger": lambda s, t: s == "Concerned" and any("efficacy" in topic.lower() or "results" in topic.lower() for topic in t),
                    "action": "Provide additional clinical trial data and arrange a peer-to-peer discussion with a KOL who has experience with similar patient populations."
                },
                "Concerned_safety": {
                    "trigger": lambda s, t: s == "Concerned" and any("safety" in topic.lower() or "side effects" in topic.lower() for topic in t),
                    "action": "Share comprehensive safety data from Phase 3 trials and offer to coordinate with the hospital's pharmacy team for risk assessment."
                },
                "Positive_cardiox": {
                    "trigger": lambda s, t: s == "Positive" and any("cardiox" in topic.lower() for topic in t),
                    "action": "Schedule a product demonstration session and provide samples for the physician's upcoming hypertension patients."
                },
                "Positive_diabetrol": {
                    "trigger": lambda s, t: s == "Positive" and any("diabetrol" in topic.lower() for topic in t),
                    "action": "Facilitate enrollment in the patient assistance program and coordinate with the diabetes nurse educator for training."
                },
                "Neutral_followup": {
                    "trigger": lambda s, t: s == "Neutral",
                    "action": "Send a comprehensive information packet including clinical data, reimbursement guide, and patient resources. Schedule a follow-up call in 2 weeks."
                },
                # "Compliance_issue": {
                #     "trigger": lambda s, t: not is_compliant,
                #     "action": "Immediately review all materials with compliance officer before any further communication. Schedule compliance training for the sales team."
                # }
            }
        for pattern in nba_patterns.values():
                if pattern["trigger"](sentiment, topics):
                    recommended_action = pattern["action"]
                    break

    


    # If no specific pattern matches, use AI to generate a contextual recommendation
    if not recommended_action:
        prompt = (f"HCP: {hcp_name}, Sentiment: {sentiment}, Topics: {topics}. "
        "Task: Provide ONE direct sales action. "
        "Rules: No conversational filler. No 'I suggest'. No 'Based on'. "
        "Start with an action verb. Max 15 words.")
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                {"role": "system", "content": "You are a concise sales coordinator. Output only the action."},
                {"role": "user", "content": prompt}
            ]
            )
            # Check if response is a dict (common in some Groq/OpenAI versions)
            if isinstance(response, dict):
                recommended_action = response['choices'][0]['message']['content'].strip()
            else:
                recommended_action = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"NBA generation error: {e}")
            recommended_action = "Schedule a follow-up call to address outstanding questions."

    # 6. State Updates
    nba_text = f"\n\nNext Best Action: {recommended_action}"
    state["next_steps"] = state.get("next_steps", "") + nba_text
    state["nba_recommendation"] = recommended_action
    state["compliance_check"] = is_compliant  # Update the global state
    state["interaction_data"]["compliance_check"] = is_compliant

    # 7. Targeted Database Update (Using the specific ID)
    if interaction_id:
        db = SessionLocal()
        try:
            interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
            if interaction:
                interaction.next_steps = state["next_steps"]
                # Sync compliance status back to DB just in case
                interaction.compliance_check = is_compliant 
                task_keywords = ["schedule", "send", "provide", "follow-up", "arrange"]
                if any(word in recommended_action.lower() for word in task_keywords):
                    new_task = FollowUp(
                        interaction_id=interaction.id,
                        date=datetime.now() + timedelta(days=7), # Matches your 'date' column
                        notes=recommended_action                 # Matches your 'notes' column
                    )
                    db.add(new_task)
                    print(f"📅 Structured follow-up created for HCP ID: {interaction.hcp_id}")

                db.commit()
                print(f"Updated interaction {interaction.id} with NBA recommendation")
        except Exception as db_error:
            print(f"Database update error in nba_suggester: {db_error}")
            db.rollback()
        finally:
            db.close()

    return {
        "next_steps": state.get("next_steps", "") + nba_text,
        "nba_recommendation": recommended_action
    }