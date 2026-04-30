import React from 'react';
import { useSelector } from 'react-redux';

const StructuredForm = () => {
  const interaction = useSelector(state => state.interaction.current);
  const extracted = useSelector(state => state.interaction.extracted);

  if (!interaction) return null;

  return (
    <div className="max-w-2xl mx-auto bg-slate-50 rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header: System Context */}
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-white font-bold text-lg">Interaction Record</h2>
          <p className="text-slate-400 text-xs font-mono">UUID: {interaction.id || 'Pending...'}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
          interaction.compliance_check ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {interaction.compliance_check ? '● Compliant' : '● Violation'}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Row 1: Primary Details */}
        <div className="grid grid-cols-2 gap-4">
          <DataField 
            label="Healthcare Professional" 
            value={interaction.hcp_name} 
            isExtracted={extracted.hcp_name}
            icon="👤"
          />
          <DataField 
            label="Interaction Date" 
            value={interaction.interaction_date} 
            isExtracted={extracted.interaction_date}
            icon="📅"
          />
        </div>

        {/* Row 2: Sentiment & Compliance Reasoning */}
        <div className="grid grid-cols-2 gap-4">
          <DataField 
            label="Sentiment Analysis" 
            value={interaction.sentiment} 
            isExtracted={extracted.sentiment}
            variant={interaction.sentiment === 'Positive' ? 'success' : 'warning'}
          />
          <DataField 
            label="Compliance Reasoning" 
            value={interaction.compliance_reasoning || 'None detected'} 
            isExtracted={true}
            variant={interaction.compliance_check ? 'default' : 'danger'}
          />
        </div>

        {/* Discussion Topics - Chip View */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discussion Topics</label>
          <div className="flex flex-wrap gap-2">
            {interaction.discussion_topics?.length > 0 ? (
              interaction.discussion_topics.map((topic, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-md shadow-sm">
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-italic text-sm">No specific topics extracted</span>
            )}
          </div>
        </div>

        {/* Next Best Action - Large Text Area */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Recommended Next Steps</label>
          <p className="mt-2 text-slate-700 text-sm leading-relaxed italic">
            "{interaction.next_steps || 'No follow-up required at this time.'}"
          </p>
        </div>
      </div>
    </div>
  );
};

// Sub-component for clean, reusable fields
const DataField = ({ label, value, isExtracted, icon, variant = 'default' }) => {
  const colors = {
    success: 'text-emerald-700',
    danger: 'text-rose-700 font-semibold',
    warning: 'text-amber-700',
    default: 'text-slate-700'
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
        {label}
        {isExtracted && <span className="ml-2 text-emerald-500 text-[8px]">● Verified</span>}
      </label>
      <div className={`p-2 bg-white border rounded-md text-sm transition-all shadow-sm ${isExtracted ? 'border-slate-200' : 'border-rose-200 bg-rose-50'} ${colors[variant]}`}>
        {icon && <span className="mr-2">{icon}</span>}
        {value || 'N/A'}
      </div>
    </div>
  );
};

export default StructuredForm;