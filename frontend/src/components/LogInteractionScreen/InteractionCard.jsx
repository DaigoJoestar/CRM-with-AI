import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

  .ic-wrap {
    font-family: 'Inter', sans-serif;
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 14px;
    overflow: hidden;
    max-width: 520px;
    margin-top: 20px;
    animation: ic-fadein 0.25s ease forwards;
  }

  .ic-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 0.5px solid rgba(0,0,0,0.06);
  }

  .ic-name {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .ic-topics {
    font-size: 12px;
    color: #aaa;
    margin: 4px 0 0;
    line-height: 1.5;
  }

  .ic-sentiment {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .ic-sentiment-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ic-sentiment--positive { background: #EAF3DE; color: #3B6D11; }
  .ic-sentiment--positive .ic-sentiment-dot { background: #639922; }

  .ic-sentiment--neutral { background: #F1EFE8; color: #5F5E5A; }
  .ic-sentiment--neutral .ic-sentiment-dot { background: #888780; }

  .ic-sentiment--concerned { background: #FAEEDA; color: #854F0B; }
  .ic-sentiment--concerned .ic-sentiment-dot { background: #BA7517; }

  .ic-compliance {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 9px 16px;
    background: #FCEBEB;
    border-bottom: 0.5px solid rgba(226,75,74,0.15);
  }

  .ic-compliance-icon {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: #F7C1C1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ic-compliance-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #A32D2D;
  }

  .ic-compliance-text {
    font-size: 12px;
    font-weight: 500;
    color: #A32D2D;
  }

  .ic-footer {
    background: #fafaf9;
    padding: 12px 16px;
  }

  .ic-footer-label {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #bbb;
    margin-bottom: 5px;
  }

  .ic-footer-text {
    font-size: 13px;
    color: #555;
    line-height: 1.6;
  }

  .ic-footer-text--empty {
    color: #bbb;
    font-style: italic;
  }

  @keyframes ic-fadein {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const SENTIMENT_MAP = {
  Positive: 'positive',
  Neutral:  'neutral',
  Concerned:'concerned',
};

const InteractionCard = () => {
  const interaction = useSelector(state => state.interaction.current);

  useEffect(() => {
    if (!document.getElementById('ic-styles')) {
      const tag = document.createElement('style');
      tag.id = 'ic-styles';
      tag.textContent = styles;
      document.head.appendChild(tag);
    }
    return () => { document.getElementById('ic-styles')?.remove(); };
  }, []);

  if (!interaction?.hcp_name) return null;

  const sentimentKey = interaction.sentiment || 'Neutral';
  const sentimentCls = SENTIMENT_MAP[sentimentKey] || 'neutral';
  const topics = interaction.discussion_topics?.join(', ') || 'No topics captured';
  const nextSteps = interaction.next_steps;

  return (
    <div className="ic-wrap">

      {/* Header */}
      <div className="ic-header">
        <div>
          <p className="ic-name">{interaction.hcp_name}</p>
          <p className="ic-topics">{topics}</p>
        </div>
        <div className={`ic-sentiment ic-sentiment--${sentimentCls}`}>
          <div className="ic-sentiment-dot" />
          {sentimentKey}
        </div>
      </div>

      {/* Compliance warning */}
      {interaction.compliance_check === false && (
        <div className="ic-compliance">
          <div className="ic-compliance-icon">
            <div className="ic-compliance-dot" />
          </div>
          <span className="ic-compliance-text">Requires Review</span>
        </div>
      )}

      {/* Next steps */}
      <div className="ic-footer">
        <div className="ic-footer-label">Next Steps</div>
        <div className={`ic-footer-text${!nextSteps ? ' ic-footer-text--empty' : ''}`}>
          {nextSteps || 'No follow-up instructions available.'}
        </div>
      </div>

    </div>
  );
};

export default InteractionCard;