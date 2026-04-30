import React from 'react';
import ChatInterface from './ChatInterface';
import StructuredForm from './StructuredForm';
import InteractionCard from './InteractionCard';

const LogInteractionScreen = () => {
  return (
    <div style={{display: 'flex', height: '100vh'}}>
      <div style={{flex: 1, padding: '20px'}}>
        <ChatInterface />
      </div>
      <div style={{flex: 1, padding: '20px'}}>
        <StructuredForm />
        <InteractionCard />
      </div>
    </div>
  );
};

export default LogInteractionScreen;