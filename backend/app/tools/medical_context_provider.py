from ..core.groq_client import client

def medical_context_provider(state):
    """
    Medical Insights Lookup (RAG): Searches internal knowledge base for technical questions
    and provides scientifically accurate talking points for next_steps.
    """
    # Mock knowledge base with clinical trial data and product information
    knowledge_base = {
        "cardiox": {
            "indication": "Treatment of hypertension in adults",
            "dosage": "10-20mg once daily",
            "efficacy": "Reduces systolic blood pressure by 15-25mmHg in clinical trials",
            "safety": "Common side effects: headache (8%), dizziness (5%), fatigue (3%)",
            "trials": "Phase 3 trial (CARDIO-301) showed 78% response rate in Stage 1-2 hypertension",
            "stage2_hypertension": "In patients with Stage 2 hypertension (BP >160/100), Cardiox demonstrated a mean reduction of 22mmHg systolic and 12mmHg diastolic in the CARDIO-302 trial"
        },
        "diabetrol": {
            "indication": "Type 2 diabetes management",
            "dosage": "5-10mg twice daily with meals",
            "efficacy": "HbA1c reduction of 1.2-1.8% in combination therapy",
            "safety": "Low risk of hypoglycemia when used as monotherapy",
            "trials": "DIABET-201 trial: 72% of patients achieved HbA1c <7%"
        },
        "oncostatin": {
            "indication": "Advanced solid tumors",
            "dosage": "150mg IV every 3 weeks",
            "efficacy": "Median PFS of 6.2 months in Phase 2 trials",
            "safety": "Grade 3-4 neutropenia in 15% of patients",
            "trials": "ONCO-105: Ongoing Phase 3 trial in NSCLC and breast cancer"
        },
        "hypertension": {
            "stage1": "SBP 130-139 or DBP 80-89 mmHg",
            "stage2": "SBP ≥140 or DBP ≥90 mmHg",
            "treatment_goals": "SBP <130 and DBP <80 mmHg for most patients"
        }
    }

    # Extract technical questions from the conversation
    messages = state.get("messages", [])
    user_text = ""
    if messages:
        for msg in messages:
            if isinstance(msg, dict) and msg.get("role") == "user":
                user_text += msg.get("content", "") + " "

    # Identify technical questions or topics
    technical_queries = []
    query_lower = user_text.lower()

    # Check for specific product questions
    for product, info in knowledge_base.items():
        if product in query_lower:
            technical_queries.append(f"Information about {product}")

    # Check for clinical questions
    if "stage 2 hypertension" in query_lower or "stage2" in query_lower:
        technical_queries.append("stage 2 hypertension treatment")
    if "efficacy" in query_lower:
        technical_queries.append("clinical efficacy data")
    if "safety" in query_lower or "side effects" in query_lower:
        technical_queries.append("safety profile")
    if "dosage" in query_lower or "dosing" in query_lower:
        technical_queries.append("dosing information")

    # Generate talking points based on identified queries
    talking_points = []

    if "cardiox" in query_lower and "stage 2 hypertension" in query_lower:
        talking_points.append("Cardiox Stage 2 Hypertension Data: In the CARDIO-302 trial, patients with Stage 2 hypertension (BP >160/100) experienced a mean reduction of 22mmHg systolic and 12mmHg diastolic pressure.")
        talking_points.append("Clinical Evidence: 78% response rate in Stage 1-2 hypertension patients, with most achieving BP control within 4 weeks.")

    if "diabetrol" in query_lower:
        talking_points.append("Diabetrol Efficacy: Achieves HbA1c reduction of 1.2-1.8% in combination therapy, with 72% of patients reaching target HbA1c <7%.")
        talking_points.append("Safety Profile: Low hypoglycemia risk as monotherapy, suitable for patients concerned about blood sugar fluctuations.")

    if "oncostatin" in query_lower:
        talking_points.append("Oncostatin Clinical Data: Median PFS of 6.2 months in Phase 2 trials for advanced solid tumors.")
        talking_points.append("Ongoing Research: Phase 3 trial (ONCO-105) currently enrolling patients with NSCLC and breast cancer.")

    # If no specific queries found, provide general context
    if not talking_points:
        talking_points.append("Clinical Evidence Base: All recommendations supported by peer-reviewed clinical trial data.")
        talking_points.append("Individualized Treatment: Therapy selection should consider patient-specific factors including comorbidities and concurrent medications.")

    # Update next_steps with medical insights
    current_next_steps = state.get("next_steps", "")
    if talking_points:
        enhanced_next_steps = current_next_steps + "\n\nMedical Insights:\n" + "\n".join(f"• {point}" for point in talking_points)
        state["next_steps"] = enhanced_next_steps.strip()
        state["medical_insights_provided"] = talking_points

    return state