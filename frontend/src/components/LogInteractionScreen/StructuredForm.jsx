import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

  .sf-wrap {
    font-family: 'Inter', sans-serif;
    padding: 1.5rem;
    max-width: 640px;
  }

  .sf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .sf-title {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .sf-legend {
    display: flex;
    gap: 12px;
  }

  .sf-legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #888;
  }

  .sf-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sf-dot--filled { background: #1D9E75; }
  .sf-dot--empty  { background: #E24B4A; }

  .sf-fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sf-row {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.1);
    border-left: 2.5px solid transparent;
    border-radius: 12px;
    padding: 14px 16px;
    display: grid;
    grid-template-columns: 120px 1fr auto;
    align-items: center;
    gap: 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
    opacity: 0;
    transform: translateY(6px);
    animation: sf-slide-in 0.3s ease forwards;
  }

  .sf-row:hover {
    border-color: rgba(0,0,0,0.18);
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .sf-row--extracted { border-left-color: #1D9E75; }
  .sf-row--missing   { border-left-color: #E24B4A; }

  .sf-label {
    font-size: 13px;
    color: #888;
    font-weight: 500;
    white-space: nowrap;
  }

  .sf-value {
    font-size: 14px;
    color: #1a1a1a;
    word-break: break-word;
  }

  .sf-value--placeholder {
    color: #bbb;
    font-style: italic;
  }

  .sf-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .sf-tag {
    font-size: 12px;
    padding: 3px 9px;
    border-radius: 99px;
    background: #E1F5EE;
    color: #0F6E56;
    border: 0.5px solid #5DCAA5;
    font-family: 'Inter', monospace;
  }

  .sf-badge {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 500;
    white-space: nowrap;
  }

  .sf-badge--ok      { background: #E1F5EE; color: #0F6E56; }
  .sf-badge--missing { background: #FCEBEB; color: #A32D2D; }

  .sf-sentiment {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    padding: 3px 10px;
    border-radius: 99px;
    font-weight: 500;
  }

  .sf-sentiment--positive { background: #EAF3DE; color: #3B6D11; }
  .sf-sentiment--neutral  { background: #F1EFE8; color: #5F5E5A; }
  .sf-sentiment--negative { background: #FCEBEB; color: #A32D2D; }

  .sf-progress {
    margin-top: 1.25rem;
  }

  .sf-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #888;
    margin-bottom: 6px;
  }

  .sf-progress-track {
    background: #f0f0f0;
    border-radius: 99px;
    height: 5px;
    overflow: hidden;
  }

  .sf-progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  }

  .sf-progress-fill--high    { background: #1D9E75; }
  .sf-progress-fill--partial { background: #EF9F27; }
  .sf-progress-fill--low     { background: #E24B4A; }

  .sf-compliance {
    background: #FCEBEB;
    border: 0.5px solid rgba(226,75,74,0.2);
    border-left: 2.5px solid #E24B4A;
    border-radius: 12px;
    padding: 12px 16px;
    margin-top: 10px;
    animation: sf-slide-in 0.3s ease forwards;
  }

  .sf-compliance-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 7px;
  }

  .sf-compliance-icon {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: #F7C1C1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sf-compliance-icon-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #A32D2D;
  }

  .sf-compliance-label {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #E24B4A;
  }

  .sf-compliance-reason {
    font-size: 13px;
    color: #A32D2D;
    line-height: 1.6;
  }

  .sf-compliance-violations {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 10px;
  }

  .sf-compliance-violation {
    font-family: 'Inter', monospace;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 4px;
    background: #F7C1C1;
    color: #791F1F;
    border: 0.5px solid rgba(163,45,45,0.2);
  }

  @keyframes sf-slide-in {
    to { opacity: 1; transform: translateY(0); }
  }
`;

const FIELD_DEFS = [
  { name: 'hcp_name',          label: 'HCP Name',  type: 'text'      },
  { name: 'interaction_date',  label: 'Date',       type: 'text'      },
  { name: 'discussion_topics', label: 'Topics',     type: 'array'     },
  { name: 'sentiment',         label: 'Sentiment',  type: 'sentiment' },
  { name: 'next_steps',        label: 'Next Steps', type: 'text'      },
];

function TagList({ items }) {
  if (!Array.isArray(items) || !items.length) {
    return <span className="sf-value sf-value--placeholder">Not captured</span>;
  }
  return (
    <div className="sf-tags">
      {items.map((t, i) => <span key={i} className="sf-tag">{t}</span>)}
    </div>
  );
}

function SentimentPill({ value }) {
  if (!value) return <span className="sf-value sf-value--placeholder">Not captured</span>;
  const cls = value === 'positive' ? 'positive' : value === 'negative' ? 'negative' : 'neutral';
  const icon = value === 'positive' ? '▲' : value === 'negative' ? '▼' : '—';
  return (
    <span className={`sf-sentiment sf-sentiment--${cls}`}>
      {icon} {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

function ComplianceBlock({ interaction, state }) {
  if (interaction.compliance_check !== false) return null;
  return (
    <div className="sf-compliance">
      <div className="sf-compliance-header">
        <div className="sf-compliance-icon">
          <div className="sf-compliance-icon-dot" />
        </div>
        <span className="sf-compliance-label">Compliance Analysis</span>
      </div>
      {interaction.compliance_reasoning && (
        <p className="sf-compliance-reason">{interaction.compliance_reasoning}</p>
      )}
      {state?.compliance_violations?.length > 0 && (
        <div className="sf-compliance-violations">
          {state.compliance_violations.map(v => (
            <span key={v} className="sf-compliance-violation">{v}</span>
          ))}
        </div>
      )}
    </div>
  );
}


function FieldValue({ field, value }) {
  if (field.type === 'array') return <TagList items={value} />;
  if (field.type === 'sentiment') return <SentimentPill value={value} />;
  if (!value) return <span className="sf-value sf-value--placeholder">Not captured</span>;
  return <span className="sf-value">{value}</span>;
}

const StructuredForm = () => {
  const interaction = useSelector(state => state.interaction.current);
  const extracted   = useSelector(state => state.interaction.extracted);
  const agentState  = useSelector(state => state.interaction.agentState);

  useEffect(() => {
    if (!document.getElementById('sf-styles')) {
      const tag = document.createElement('style');
      tag.id = 'sf-styles';
      tag.textContent = styles;
      document.head.appendChild(tag);
    }
    return () => {
      const tag = document.getElementById('sf-styles');
      if (tag) tag.remove();
    };
  }, []);

  const filledCount = FIELD_DEFS.filter(f => extracted[f.name]).length;
  const pct         = Math.round((filledCount / FIELD_DEFS.length) * 100);
  const fillClass   = pct >= 80 ? 'high' : pct >= 50 ? 'partial' : 'low';

  return (
    <div className="sf-wrap">
      <div className="sf-header">
        <p className="sf-title">HCP Interaction</p>
        <div className="sf-legend">
          <div className="sf-legend-item">
            <div className="sf-dot sf-dot--filled" />
            Extracted
          </div>
          <div className="sf-legend-item">
            <div className="sf-dot sf-dot--empty" />
            Missing
          </div>
        </div>
      </div>

      <div className="sf-fields">
        {FIELD_DEFS.map((field, i) => {
          const isExtracted = !!extracted[field.name];
          return (
            <div
              key={field.name}
              className={`sf-row sf-row--${isExtracted ? 'extracted' : 'missing'}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="sf-label">{field.label}</span>
              <FieldValue field={field} value={interaction[field.name]} />
              <span className={`sf-badge sf-badge--${isExtracted ? 'ok' : 'missing'}`}>
                {isExtracted ? 'Extracted' : 'Missing'}
              </span>
            </div>
          );
        })}
      </div>

      <ComplianceBlock interaction={interaction} state={agentState} />

      <div className="sf-progress">
        <div className="sf-progress-labels">
          <span>Completion</span>
          <span>{pct}%</span>
        </div>
        <div className="sf-progress-track">
          <div
            className={`sf-progress-fill sf-progress-fill--${fillClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StructuredForm;