from ..core.database import SessionLocal
from ..models.interaction import Interaction

def compliance_validator(state):
    discussion_topics = state.get("discussion_topics", [])
    next_steps = state.get("next_steps", "")

    high_risk_keywords = [
        "off-label", "guaranteed results", "cure", "100%", "effective",
        "miracle drug", "breakthrough cure", "instant relief",
        "no side effects", "completely safe", "clinically proven to cure",
        "fda approved for all uses", "works for everyone"
    ]
    llm_says_compliant = state.get("compliance_check", True)
    
    topics_text = " ".join(discussion_topics).lower() if discussion_topics else ""
    next_steps_text = next_steps.lower() if next_steps else ""

# Run your keyword check
    has_high_risk = any(keyword in topics_text or keyword in next_steps_text for keyword in high_risk_keywords)

    # FINAL DECISION:
    # It is only True if BOTH the LLM thinks it's okay AND our keywords weren't found.
    # If either one is False, the whole thing is False.
    final_compliance_status = llm_says_compliant and not has_high_risk

    violations = [kw for kw in high_risk_keywords if kw in topics_text or kw in next_steps_text]
    # If LLM said False but keywords didn't trigger, add a generic violation
    if not llm_says_compliant and not violations:
        violations.append("LLM Flagged: Potential high-risk content detected")

        

    # Determine compliance status
    has_high_risk = any(keyword in topics_text or keyword in next_steps_text for keyword in high_risk_keywords)
    
    # 1. Update local state variables
    new_compliance_status = not has_high_risk
    violations = [kw for kw in high_risk_keywords if kw in topics_text or kw in next_steps_text] if has_high_risk else []

    # 2. Update Database using the dynamic ID
    current_id = state.get("last_interaction_id")
    if current_id:
        db = SessionLocal()
        try:
            interaction = db.query(Interaction).filter(Interaction.id == current_id).first()
            if interaction:
                interaction.compliance_check = new_compliance_status
                db.commit()
                print(f"✅ DB Sync: Interaction {interaction.id} set to {new_compliance_status}")
        except Exception as db_error:
            print(f"❌ DB Error: {db_error}")
            db.rollback()
        finally:
            db.close()

    # 3. CRITICAL: Explicitly update and return the state keys
    # This ensures both the global state and nested interaction_data are in sync
    state["compliance_check"] = new_compliance_status
    state["compliance_violations"] = violations
    
    state.compliance_check = new_compliance_status
    state.compliance_violations = violations
    
    if "interaction_data" in state:
        state["interaction_data"]["compliance_check"] = new_compliance_status
    return {
        "compliance_check": final_compliance_status,
        "compliance_violations": violations,
        "interaction_data": state.get("interaction_data")
    }