const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

  .tt-wrap {
    font-family: 'Inter', sans-serif;
    margin-top: 12px;
    background: #fafaf9;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 10px;
    overflow: hidden;
    animation: tt-fadein 0.2s ease forwards;
  }

  .tt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 0.5px solid rgba(0,0,0,0.06);
    background: #fff;
  }

  .tt-header-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tt-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #aaa;
  }

  .tt-hcp {
    font-size: 11px;
    font-weight: 500;
    color: #1D9E75;
    padding: 2px 7px;
    background: #E1F5EE;
    border-radius: 99px;
  }

  .tt-id {
    font-family: 'Inter', monospace;
    font-size: 10px;
    color: #ccc;
  }

  .tt-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5px;
    background: rgba(0,0,0,0.06);
  }

  .tt-metric {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fafaf9;
    padding: 9px 12px;
  }

  .tt-metric-icon {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tt-metric-icon--ok      { background: #E1F5EE; }
  .tt-metric-icon--fail    { background: #FCEBEB; }
  .tt-metric-icon--neutral { background: #F1EFE8; }
  .tt-metric-icon--pos     { background: #EAF3DE; }
  .tt-metric-icon--neg     { background: #FCEBEB; }

  .tt-metric-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .tt-metric-dot--ok      { background: #1D9E75; }
  .tt-metric-dot--fail    { background: #E24B4A; }
  .tt-metric-dot--neutral { background: #888780; }
  .tt-metric-dot--pos     { background: #639922; }
  .tt-metric-dot--neg     { background: #E24B4A; }

  .tt-metric-sublabel {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #bbb;
    font-weight: 500;
    line-height: 1;
  }

  .tt-metric-value {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    margin-top: 2px;
  }

  .tt-metric-value--ok      { color: #0F6E56; }
  .tt-metric-value--fail    { color: #A32D2D; }
  .tt-metric-value--neutral { color: #5F5E5A; }
  .tt-metric-value--pos     { color: #3B6D11; }
  .tt-metric-value--neg     { color: #A32D2D; }

  .tt-suggestion {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 9px 12px;
    border-top: 0.5px solid rgba(0,0,0,0.06);
    background: #fff;
  }

  .tt-suggestion-icon {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: #EEEDFE;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .tt-suggestion-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #534AB7;
  }

  .tt-suggestion-label {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #AFA9EC;
    line-height: 1;
  }

  .tt-suggestion-text {
    font-size: 12px;
    color: #3C3489;
    line-height: 1.5;
    margin-top: 2px;
  }

  @keyframes tt-fadein {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const sentimentConfig = (val) => {
  if (val === "Positive") return { cls: "pos",     label: "Positive" };
  if (val === "Concerned") return { cls: "neg",    label: "Concerned" };
  return                          { cls: "neutral", label: val || "Neutral" };
};

const ToolTrace = ({ state }) => {
  if (!state) return null;

  if (!document.getElementById("tt-styles")) {
    const tag = document.createElement("style");
    tag.id = "tt-styles";
    tag.textContent = styles;
    document.head.appendChild(tag);
  }

  const complianceCls = state.compliance_check ? "ok" : "fail";
  const complianceLabel = state.compliance_check ? "Cleared" : "Flagged";
  const sentiment = sentimentConfig(state.sentiment);

  return (
    <div className="tt-wrap">

      {/* Header */}
      <div className="tt-header">
        <div className="tt-header-left">
          <span className="tt-label">Audit Trace</span>
          {state.hcp_name && (
            <span className="tt-hcp">{state.hcp_name}</span>
          )}
        </div>
        {state.last_interaction_id && (
          <span className="tt-id">
            {state.last_interaction_id.slice(0, 8)}
          </span>
        )}
      </div>

      {/* Metrics grid */}
      <div className="tt-metrics">
        {/* Compliance */}
        <div className="tt-metric">
          <div className={`tt-metric-icon tt-metric-icon--${complianceCls}`}>
            <div className={`tt-metric-dot tt-metric-dot--${complianceCls}`} />
          </div>
          <div>
            <div className="tt-metric-sublabel">Compliance</div>
            <div className={`tt-metric-value tt-metric-value--${complianceCls}`}>
              {complianceLabel}
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="tt-metric">
          <div className={`tt-metric-icon tt-metric-icon--${sentiment.cls}`}>
            <div className={`tt-metric-dot tt-metric-dot--${sentiment.cls}`} />
          </div>
          <div>
            <div className="tt-metric-sublabel">Sentiment</div>
            <div className={`tt-metric-value tt-metric-value--${sentiment.cls}`}>
              {sentiment.label}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion footer */}
      {state.nba_recommendation && (
        <div className="tt-suggestion">
          <div className="tt-suggestion-icon">
            <div className="tt-suggestion-dot" />
          </div>
          <div>
            <div className="tt-suggestion-label">System Suggestion</div>
            <div className="tt-suggestion-text">{state.nba_recommendation}</div>
          </div>
        </div>
      )}

      {/* Medical insights (from medical_context_provider) */}
      {state.medical_insights_provided && state.medical_insights_provided.length > 0 && (
        <div style={{ padding: '10px 12px', borderTop: '0.5px solid rgba(0,0,0,0.06)', background: '#fff' }}>
          <div className="tt-suggestion-label">Medical Insights</div>
          <div style={{ marginTop: 6 }}>
            {state.medical_insights_provided.map((pt, idx) => (
              <div key={idx} className="tt-suggestion-text">{pt}</div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ToolTrace;