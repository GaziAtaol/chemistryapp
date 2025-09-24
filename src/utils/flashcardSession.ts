// Flashcard session management utilities
import type { Element } from '../types';
import { allElements } from '../data/elements';
import { loadSettings } from './storage';

interface FlashcardSession {
  date: string; // YYYY-MM-DD format
  shownElements: number[]; // Array of element atomic numbers shown today
  completedCount: number;
  targetCount: number;
}

const FLASHCARD_SESSION_KEY = 'chemistry-app-flashcard-session';

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Load current session or create new one for today
export const loadFlashcardSession = (): FlashcardSession => {
  try {
    const stored = localStorage.getItem(FLASHCARD_SESSION_KEY);
    const today = getTodayDateString();
    const settings = loadSettings();
    
    if (stored) {
      const session: FlashcardSession = JSON.parse(stored);
      
      // If it's a new day, reset the session
      if (session.date !== today) {
        return {
          date: today,
          shownElements: [],
          completedCount: 0,
          targetCount: settings.daily_flashcard_target
        };
      }
      
      // Update target count if settings changed
      return {
        ...session,
        targetCount: settings.daily_flashcard_target
      };
    }
    
    // Create new session
    return {
      date: today,
      shownElements: [],
      completedCount: 0,
      targetCount: settings.daily_flashcard_target
    };
  } catch (error) {
    console.error('Error loading flashcard session:', error);
    const settings = loadSettings();
    return {
      date: getTodayDateString(),
      shownElements: [],
      completedCount: 0,
      targetCount: settings.daily_flashcard_target
    };
  }
};

// Save current session
export const saveFlashcardSession = (session: FlashcardSession): void => {
  try {
    localStorage.setItem(FLASHCARD_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving flashcard session:', error);
  }
};

// Get a random element that hasn't been shown today
export const getRandomUnshownElement = (session: FlashcardSession): Element | null => {
  const availableElements = allElements.filter(
    element => !session.shownElements.includes(element.z)
  );
  
  if (availableElements.length === 0) {
    return null; // All elements have been shown
  }
  
  const randomIndex = Math.floor(Math.random() * availableElements.length);
  return availableElements[randomIndex];
};

// Mark an element as shown and increment completed count
export const markElementAsShown = (elementId: number): FlashcardSession => {
  const session = loadFlashcardSession();
  
  if (!session.shownElements.includes(elementId)) {
    session.shownElements.push(elementId);
    session.completedCount = session.shownElements.length;
  }
  
  saveFlashcardSession(session);
  return session;
};

// Check if daily target is reached
export const isDailyTargetReached = (session?: FlashcardSession): boolean => {
  const currentSession = session || loadFlashcardSession();
  return currentSession.completedCount >= currentSession.targetCount;
};

// Get progress information
export const getSessionProgress = (session?: FlashcardSession): {
  completed: number;
  target: number;
  percentage: number;
  remaining: number;
} => {
  const currentSession = session || loadFlashcardSession();
  
  return {
    completed: currentSession.completedCount,
    target: currentSession.targetCount,
    percentage: Math.round((currentSession.completedCount / currentSession.targetCount) * 100),
    remaining: Math.max(0, currentSession.targetCount - currentSession.completedCount)
  };
};