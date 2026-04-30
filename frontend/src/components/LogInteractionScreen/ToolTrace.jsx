const ToolTrace = ({ state }) => {
  if (!state) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* 1. Header: Quick Status */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Audit Trace
          </span>
          {state.hcp_name && (
            <span className="text-xs font-medium text-blue-600">
              • HCP: {state.hcp_name}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400">ID: {state.last_interaction_id?.slice(0, 8)}</span>
      </div>

      {/* 2. Main Content: Grid for Metrics */}
      <div className="grid grid-cols-2 gap-px bg-gray-100">
        {/* Compliance Slot */}
        <div className={`flex items-center gap-3 bg-white p-3 ${
            state.compliance_check ? 'text-green-700' : 'text-red-700 font-bold'
          }`}>
          <span className="text-lg">{state.compliance_check ? '🛡️' : '🚫'}</span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400">Compliance</span>
            <span className="text-xs">{state.compliance_check ? 'Cleared' : 'Flagged'}</span>
          </div>
        </div>

        {/* Sentiment Slot */}
        <div className="flex items-center gap-3 bg-white p-3 text-gray-700">
          <span className="text-lg">
            {state.sentiment === 'Positive' ? '😊' : state.sentiment === 'Concerned' ? '😟' : '😐'}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400">Sentiment</span>
            <span className="text-xs">{state.sentiment || 'Neutral'}</span>
          </div>
        </div>
      </div>

      {/* 3. Footer: Action Item (Only if relevant) */}
      {state.nba_recommendation && (
        <div className="border-t border-gray-100 bg-purple-50/30 p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-purple-600">📅</span>
            <div>
              <p className="text-[11px] font-bold text-purple-800 uppercase">System Suggestion</p>
              <p className="text-xs text-purple-900 leading-relaxed">
                {state.nba_recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ToolTrace;