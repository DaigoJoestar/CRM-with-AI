import React from 'react';
import { useSelector } from 'react-redux';

const sentimentStyles = {
  Positive: { color: '#22c55e', label: 'Positive' },
  Neutral: { color: '#64748b', label: 'Neutral' },
  Concerned: { color: '#f97316', label: 'Concerned' },
};

const InteractionCard = () => {
  const interaction = useSelector((state) => state.interaction.current);

  if (!interaction || !interaction.hcp_name) {
    return null;
  }

  const sentiment = interaction.sentiment || 'Neutral';
  const sentimentStyle = sentimentStyles[sentiment] || sentimentStyles.Neutral;

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      background: '#ffffff',
      padding: '20px',
      marginTop: '24px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
      maxWidth: '520px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{interaction.hcp_name}</h3>
          <p style={{ margin: '8px 0 0', color: '#475569' }}>{interaction.discussion_topics?.join(', ') || 'No topics captured'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: sentimentStyle.color,
            display: 'inline-block'
          }} />
          <span style={{ fontWeight: 600, color: sentimentStyle.color }}>{sentimentStyle.label}</span>
        </div>
      </div>

      {interaction.compliance_check === false && (
        <div style={{
          marginTop: '18px',
          padding: '12px 14px',
          background: '#fee2e2',
          color: '#b91c1c',
          borderRadius: '12px',
          fontWeight: 600
        }}>Requires Review</div>
      )}

      <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
        <div style={{ marginBottom: '10px', color: '#334155', fontWeight: 700 }}>Todo</div>
        <div style={{ color: '#475569', lineHeight: 1.6 }}>
          {interaction.next_steps || 'No follow-up instructions available.'}
        </div>
      </div>
    </div>
  );
};

export default InteractionCard;
