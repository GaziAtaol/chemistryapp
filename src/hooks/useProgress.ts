// Central progress tracking hook
import { useState, useEffect, useCallback } from 'react';
import type { ProgressState, DailyProgress, QuizProgress } from '../types';
import { loadAppData, saveAppData } from '../utils/storage';

const getTodayDateKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getDefaultProgress = (): ProgressState => {
  const today = getTodayDateKey();
  return {
    daily: {
      flashcardsTarget: 20,
      flashcardsDone: 0,
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
};

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>(() => {
    const appData = loadAppData();
    if (!appData.progress) {
      const defaultProgress = getDefaultProgress();
      // Initialize with settings
      const settings = appData.settings;
      if (settings) {
        defaultProgress.daily.flashcardsTarget = settings.daily_flashcard_target;
      }
      return defaultProgress;
    }
    
    // Check if we need to reset daily progress for new day
    const today = getTodayDateKey();
    if (appData.progress.daily.dateKey !== today) {
      const resetProgress = {
        ...appData.progress,
        daily: {
          ...appData.progress.daily,
          flashcardsDone: 0,
          dateKey: today
        },
        achievements: {
          ...appData.progress.achievements,
          queue: [] // Clear queue on new day
        }
      };
      return resetProgress;
    }
    
    return appData.progress;
  });

  // Debounced save to localStorage
  const [saveTimeout, setSaveTimeout] = useState<number | null>(null);

  const saveProgress = useCallback((newProgress: ProgressState) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      const appData = loadAppData();
      saveAppData({ ...appData, progress: newProgress });
    }, 200); // 200ms debounce
    
    setSaveTimeout(timeout);
  }, [saveTimeout]);

  // Update progress and save
  const updateProgress = useCallback((updates: Partial<ProgressState>) => {
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  // Update daily progress
  const updateDailyProgress = useCallback((updates: Partial<DailyProgress>) => {
    const newDaily = { ...progress.daily, ...updates };
    updateProgress({ daily: newDaily });
  }, [progress.daily, updateProgress]);

  // Update quiz progress
  const updateQuizProgress = useCallback((updates: Partial<QuizProgress>) => {
    const newQuiz = { ...progress.quiz, ...updates };
    updateProgress({ quiz: newQuiz });
  }, [progress.quiz, updateProgress]);

  // Increment flashcard done count
  const incrementFlashcardsDone = useCallback(() => {
    const today = getTodayDateKey();
    
    // Reset if new day
    if (progress.daily.dateKey !== today) {
      updateDailyProgress({
        flashcardsDone: 1,
        dateKey: today
      });
    } else {
      updateDailyProgress({
        flashcardsDone: progress.daily.flashcardsDone + 1
      });
    }
  }, [progress.daily, updateDailyProgress]);

  // Check if daily target is reached
  const isDailyTargetReached = useCallback(() => {
    return progress.daily.flashcardsDone >= progress.daily.flashcardsTarget;
  }, [progress.daily]);

  // Get progress percentage
  const getDailyProgressPercentage = useCallback(() => {
    if (progress.daily.flashcardsTarget === 0) return 0;
    return Math.min(100, (progress.daily.flashcardsDone / progress.daily.flashcardsTarget) * 100);
  }, [progress.daily]);

  // Add achievement to queue
  const queueAchievement = useCallback((achievementId: string) => {
    const timestamp = new Date().toISOString();
    const newAchievement = { id: achievementId, timestamp };
    
    // Check if already in queue or unlocked
    const alreadyQueued = progress.achievements.queue.some(a => a.id === achievementId);
    const alreadyUnlocked = progress.achievements.unlocked.some(a => a.id === achievementId);
    
    if (!alreadyQueued && !alreadyUnlocked) {
      const newAchievements = {
        ...progress.achievements,
        queue: [...progress.achievements.queue, newAchievement]
      };
      updateProgress({ achievements: newAchievements });
    }
  }, [progress.achievements, updateProgress]);

  // Mark achievement as viewed (move from queue to unlocked)
  const markAchievementViewed = useCallback((achievementId: string) => {
    const queueItem = progress.achievements.queue.find(a => a.id === achievementId);
    if (queueItem) {
      const newAchievements = {
        unlocked: [...progress.achievements.unlocked, queueItem],
        queue: progress.achievements.queue.filter(a => a.id !== achievementId)
      };
      updateProgress({ achievements: newAchievements });
    }
  }, [progress.achievements, updateProgress]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    progress,
    updateProgress,
    updateDailyProgress,
    updateQuizProgress,
    incrementFlashcardsDone,
    isDailyTargetReached,
    getDailyProgressPercentage,
    queueAchievement,
    markAchievementViewed
  };
};