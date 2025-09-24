// Achievement tracking and management utilities

import type { UserAchievement, Achievement } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { loadAppData, saveAppData } from './storage';

// Initialize user achievements if they don't exist
export const initializeAchievements = (): UserAchievement[] => {
  return ACHIEVEMENTS.map(achievement => ({
    achievement_id: achievement.id,
    unlocked: false,
    progress: 0,
    current_value: 0
  }));
};

// Update achievement progress and check for unlocks
export const updateAchievements = (): { newUnlocks: Achievement[], updatedAchievements: UserAchievement[] } => {
  const appData = loadAppData();
  
  // Initialize achievements if they don't exist
  if (!appData.achievements) {
    appData.achievements = initializeAchievements();
    saveAppData({ achievements: appData.achievements });
  }
  
  const newUnlocks: Achievement[] = [];
  const updatedAchievements = appData.achievements.map(userAchievement => {
    const achievement = ACHIEVEMENTS.find(a => a.id === userAchievement.achievement_id);
    if (!achievement) return userAchievement;
    
    // Special handling for chemist-badge (75% of achievements)
    let currentValue: number;
    if (achievement.id === 'chemist-badge') {
      const unlockedCount = appData.achievements.filter(ua => 
        ua.unlocked && ua.achievement_id !== 'chemist-badge'
      ).length;
      currentValue = unlockedCount;
    } else {
      currentValue = achievement.check_function(appData);
    }
    
    const progress = Math.min((currentValue / achievement.target_value) * 100, 100);
    const shouldUnlock = progress >= 100 && !userAchievement.unlocked;
    
    if (shouldUnlock) {
      newUnlocks.push(achievement);
    }
    
    return {
      ...userAchievement,
      progress,
      current_value: currentValue,
      unlocked: shouldUnlock || userAchievement.unlocked,
      unlock_date: shouldUnlock ? new Date() : userAchievement.unlock_date
    };
  });
  
  // Save updated achievements
  saveAppData({ achievements: updatedAchievements });
  
  return { newUnlocks, updatedAchievements };
};

// Get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
};

// Get user achievement by ID
export const getUserAchievementById = (id: string): UserAchievement | undefined => {
  const appData = loadAppData();
  if (!appData.achievements) return undefined;
  return appData.achievements.find(userAchievement => userAchievement.achievement_id === id);
};

// Get all achievements with their user progress
export const getAllAchievementsWithProgress = (): Array<{
  achievement: Achievement;
  userAchievement: UserAchievement;
}> => {
  const appData = loadAppData();
  
  // Initialize achievements if they don't exist
  if (!appData.achievements) {
    const initialAchievements = initializeAchievements();
    saveAppData({ achievements: initialAchievements });
    appData.achievements = initialAchievements;
  }
  
  return ACHIEVEMENTS.map(achievement => {
    const userAchievement = appData.achievements.find(ua => ua.achievement_id === achievement.id) || {
      achievement_id: achievement.id,
      unlocked: false,
      progress: 0,
      current_value: 0
    };
    
    return { achievement, userAchievement };
  });
};

// Get achievement statistics
export const getAchievementStats = () => {
  const achievementsWithProgress = getAllAchievementsWithProgress();
  const totalAchievements = achievementsWithProgress.length;
  const unlockedAchievements = achievementsWithProgress.filter(a => a.userAchievement.unlocked).length;
  const overallProgress = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;
  
  // Category statistics
  const categories = ['flashcards', 'quiz', 'consistency', 'exploration', 'mastery'] as const;
  const categoryStats = categories.map(category => {
    const categoryAchievements = achievementsWithProgress.filter(a => a.achievement.category === category);
    const categoryUnlocked = categoryAchievements.filter(a => a.userAchievement.unlocked).length;
    const categoryProgress = categoryAchievements.length > 0 ? (categoryUnlocked / categoryAchievements.length) * 100 : 0;
    
    return {
      category,
      total: categoryAchievements.length,
      unlocked: categoryUnlocked,
      progress: categoryProgress
    };
  });
  
  return {
    totalAchievements,
    unlockedAchievements,
    overallProgress,
    categoryStats
  };
};

// Show achievement unlock notification (placeholder for future implementation)
export const showAchievementNotification = (achievement: Achievement) => {
  console.log(`🏆 Achievement Unlocked: ${achievement.name_key}!`);
  // TODO: Implement proper notification system
};

// Auto-update achievements (call this after significant user actions)
export const checkAndUpdateAchievements = () => {
  const { newUnlocks } = updateAchievements();
  
  // Show notifications for new unlocks
  newUnlocks.forEach(achievement => {
    showAchievementNotification(achievement);
  });
  
  return newUnlocks;
};