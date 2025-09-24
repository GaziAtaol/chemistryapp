// Utility functions to sync various events with the central progress store
import { loadAppData, saveAppData } from './storage';
import type { QuizResults } from '../components/Quiz/QuizTaking';

// Sync quiz completion with progress store
export const syncQuizCompletion = (results: QuizResults): void => {
  try {
    const appData = loadAppData();
    const now = new Date().toISOString();
    
    // Initialize progress if it doesn't exist
    if (!appData.progress) {
      appData.progress = {
        daily: {
          flashcardsTarget: 20,
          flashcardsDone: 0,
          dateKey: new Date().toISOString().split('T')[0]
        },
        quiz: {
          lastScore: results.score,
          lastTakenAt: now
        },
        achievements: {
          unlocked: [],
          queue: []
        }
      };
    } else {
      // Update quiz progress
      appData.progress.quiz = {
        lastScore: results.score,
        lastTakenAt: now
      };
    }
    
    saveAppData(appData);
    
    // Check for achievements (we'll implement this later)
    checkQuizAchievements(results);
  } catch (error) {
    console.error('Error syncing quiz completion:', error);
  }
};

// Check and queue quiz-related achievements
const checkQuizAchievements = (results: QuizResults): void => {
  try {
    const appData = loadAppData();
    if (!appData.progress) return;
    
    const achievementsToQueue: string[] = [];
    
    // Check for perfect score achievement
    if (results.score >= 100) {
      achievementsToQueue.push('perfect_score');
    }
    
    // Check for excellent score achievement
    if (results.score >= 90) {
      achievementsToQueue.push('excellent_score');
    }
    
    // Queue achievements
    if (achievementsToQueue.length > 0) {
      const timestamp = new Date().toISOString();
      const currentQueue = appData.progress.achievements.queue;
      const currentUnlocked = appData.progress.achievements.unlocked;
      
      achievementsToQueue.forEach(achievementId => {
        // Don't queue if already queued or unlocked
        const alreadyQueued = currentQueue.some(a => a.id === achievementId);
        const alreadyUnlocked = currentUnlocked.some(a => a.id === achievementId);
        
        if (!alreadyQueued && !alreadyUnlocked) {
          currentQueue.push({ id: achievementId, timestamp });
        }
      });
      
      saveAppData(appData);
    }
  } catch (error) {
    console.error('Error checking quiz achievements:', error);
  }
};

// Sync flashcard completion with progress store  
export const syncFlashcardProgress = (_elementId: number): void => {
  try {
    const appData = loadAppData();
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize progress if it doesn't exist
    if (!appData.progress) {
      const settings = appData.settings || { daily_flashcard_target: 20 };
      appData.progress = {
        daily: {
          flashcardsTarget: settings.daily_flashcard_target,
          flashcardsDone: 1,
          dateKey: today
        },
        quiz: {
          lastScore: 0,
          lastTakenAt: ''
        },
        achievements: {
          unlocked: [],
          queue: []
        }
      };
    } else {
      // Reset if new day
      if (appData.progress.daily.dateKey !== today) {
        appData.progress.daily = {
          ...appData.progress.daily,
          flashcardsDone: 1,
          dateKey: today
        };
      } else {
        appData.progress.daily.flashcardsDone += 1;
      }
    }
    
    saveAppData(appData);
    
    // Check for achievements
    checkFlashcardAchievements();
  } catch (error) {
    console.error('Error syncing flashcard progress:', error);
  }
};

// Check and queue flashcard-related achievements
const checkFlashcardAchievements = (): void => {
  try {
    const appData = loadAppData();
    if (!appData.progress) return;
    
    const achievementsToQueue: string[] = [];
    const { flashcardsDone, flashcardsTarget } = appData.progress.daily;
    
    // Check for daily target achievement
    if (flashcardsDone >= flashcardsTarget) {
      achievementsToQueue.push('daily_target_reached');
    }
    
    // Check for milestones
    if (flashcardsDone >= 10) {
      achievementsToQueue.push('flashcard_milestone_10');
    }
    
    if (flashcardsDone >= 50) {
      achievementsToQueue.push('flashcard_milestone_50');
    }
    
    // Queue achievements
    if (achievementsToQueue.length > 0) {
      const timestamp = new Date().toISOString();
      const currentQueue = appData.progress.achievements.queue;
      const currentUnlocked = appData.progress.achievements.unlocked;
      
      achievementsToQueue.forEach(achievementId => {
        const alreadyQueued = currentQueue.some(a => a.id === achievementId);
        const alreadyUnlocked = currentUnlocked.some(a => a.id === achievementId);
        
        if (!alreadyQueued && !alreadyUnlocked) {
          currentQueue.push({ id: achievementId, timestamp });
        }
      });
      
      saveAppData(appData);
    }
  } catch (error) {
    console.error('Error checking flashcard achievements:', error);
  }
};