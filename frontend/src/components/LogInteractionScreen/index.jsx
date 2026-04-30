import React, { useEffect } from 'react';
import ChatInterface from './ChatInterface';
import StructuredForm from './StructuredForm';
import InteractionCard from './InteractionCard';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .lis-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f5f4f2;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  /* ── Top bar ── */
  .lis-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 52px;
    background: #fff;
    border-bottom: 0.5px solid rgba(0,0,0,0.08);
    flex-shrink: 0;
  }

  .lis-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .lis-logo {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lis-logo-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #1D9E75;
  }

  .lis-app-name {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .lis-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #bbb;
    padding-left: 14px;
    border-left: 0.5px solid rgba(0,0,0,0.1);
    margin-left: 14px;
  }

  .lis-breadcrumb-active {
    color: #555;
    font-weight: 500;
  }

  .lis-topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .lis-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 99px;
    background: #E1F5EE;
    color: #0F6E56;
    border: 0.5px solid #5DCAA5;
  }

  .lis-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f0f0ee;
    border: 0.5px solid rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    color: #888;
    font-family: 'Inter', monospace;
  }

  /* ── Body ── */
  .lis-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px 24px;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  /* ── Panels ── */
  .lis-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .lis-panel-label {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #bbb;
    margin-bottom: 8px;
    padding-left: 2px;
  }

  .lis-panel-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* right panel scrolls */
  .lis-right-scroll {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 2px;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.1) transparent;
  }

  .lis-right-scroll::-webkit-scrollbar { width: 3px; }
  .lis-right-scroll::-webkit-scrollbar-track { background: transparent; }
  .lis-right-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 99px; }

  /* override child component margins that fight the layout */
  .lis-right-scroll .sf-wrap { padding: 1.25rem; }
  .lis-right-scroll .ic-wrap { margin-top: 0; }

  /* divider between form & card */
  .lis-divider {
    height: 0.5px;
    background: rgba(0,0,0,0.07);
    flex-shrink: 0;
  }

  /* ── Chat panel fills height ── */
  .lis-panel-content .ci-wrap {
    flex: 1;
    min-height: 0;
  }
`;

const LogInteractionScreen = () => {
  useEffect(() => {
    if (!document.getElementById('lis-styles')) {
      const tag = document.createElement('style');
      tag.id = 'lis-styles';
      tag.textContent = styles;
      document.head.appendChild(tag);
    }
    return () => { document.getElementById('lis-styles')?.remove(); };
  }, []);

  return (
    <div className="lis-root">

      {/* Top bar */}
      <div className="lis-topbar">
        <div className="lis-topbar-left">
          <div className="lis-logo">
            <div className="lis-logo-dot" />
          </div>
          <span className="lis-app-name">HCP CRM</span>
          <div className="lis-breadcrumb">
            <span>Interactions</span>
            <span>›</span>
            <span className="lis-breadcrumb-active">Log Interaction</span>
          </div>
        </div>
        <div className="lis-topbar-right">
          <span className="lis-badge">AI Assisted</span>
          <div className="lis-avatar">JS</div>
        </div>
      </div>

      {/* Main body */}
      <div className="lis-body">

        {/* Left — Chat */}
        <div className="lis-panel">
          <div className="lis-panel-label">Assistant</div>
          <div className="lis-panel-content">
            <ChatInterface />
          </div>
        </div>

        {/* Right — Form + Card */}
        <div className="lis-panel">
          <div className="lis-panel-label">Extracted Data</div>
          <div className="lis-right-scroll">
            <StructuredForm />
            <div className="lis-divider" />
            <InteractionCard />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogInteractionScreen;