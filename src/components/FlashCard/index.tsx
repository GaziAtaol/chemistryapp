import React, { useState } from 'react';
import FlashCardSession from './FlashCardSession';
import SessionComplete from './SessionComplete';
import { 
  loadFlashcardSession, 
  isDailyTargetReached
} from '../../utils/flashcardSession';

const FlashCardApp: React.FC = () => {
  const [sessionState, setSessionState] = useState<'active' | 'complete'>(() => {
    const session = loadFlashcardSession();
    return isDailyTargetReached(session) ? 'complete' : 'active';
  });

  const handleSessionComplete = () => {
    setSessionState('complete');
  };

  const handleRestart = () => {
    const session = loadFlashcardSession();
    if (!isDailyTargetReached(session)) {
      setSessionState('active');
    }
  };

  if (sessionState === 'complete') {
    return <SessionComplete onRestart={handleRestart} />;
  }

  return <FlashCardSession onSessionComplete={handleSessionComplete} />;
};

export default FlashCardApp;