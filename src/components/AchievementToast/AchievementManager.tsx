import React, { useEffect, useState } from 'react';
import AchievementToast from './AchievementToast';
import { useProgress } from '../../hooks/useProgress';

// Achievement definitions - in a real app these would come from a config or API
const ACHIEVEMENT_DATA = {
  daily_target_reached: {
    title: 'Günlük Hedef!',
    description: 'Bugünkü flashcard hedefini başarıyla tamamladın!',
    icon: '🎯',
    progress: 'Hedef tamamlandı!'
  },
  perfect_score: {
    title: 'Mükemmel Skor!',
    description: 'Quiz\'de %100 puan aldın!',
    icon: '🏆',
    progress: '100/100 doğru'
  },
  excellent_score: {
    title: 'Harika Skor!',
    description: 'Quiz\'de %90 ve üzeri puan aldın!',
    icon: '⭐',
    progress: '90%+ başarı'
  },
  flashcard_milestone_10: {
    title: 'İlk 10 Kart!',
    description: 'Bugün 10 flashcard tamamladın!',
    icon: '🚀',
    progress: '10/10 tamamlandı'
  },
  flashcard_milestone_50: {
    title: 'Süper Öğrenci!',
    description: 'Bugün 50 flashcard tamamladın!',
    icon: '🔥',
    progress: '50/50 tamamlandı'
  }
};

interface AchievementManagerProps {
  onNavigateToAchievements?: () => void;
}

const AchievementManager: React.FC<AchievementManagerProps> = ({ 
  onNavigateToAchievements 
}) => {
  const { progress, markAchievementViewed } = useProgress();
  const [currentToast, setCurrentToast] = useState<string | null>(null);
  const [toastQueue, setToastQueue] = useState<Array<{ id: string; timestamp: string }>>([]);

  // Update local queue when progress changes
  useEffect(() => {
    setToastQueue(progress.achievements.queue);
  }, [progress.achievements.queue]);

  // Show next toast when current one is closed or when queue changes
  useEffect(() => {
    if (!currentToast && toastQueue.length > 0) {
      // Show the oldest achievement first (FIFO)
      const nextAchievement = toastQueue[0];
      setCurrentToast(nextAchievement.id);
    }
  }, [currentToast, toastQueue]);

  const handleView = () => {
    if (currentToast) {
      markAchievementViewed(currentToast);
      setCurrentToast(null);
      
      // Navigate to achievements page if handler provided
      if (onNavigateToAchievements) {
        onNavigateToAchievements();
      }
    }
  };

  const handleClose = () => {
    if (currentToast) {
      markAchievementViewed(currentToast);
      setCurrentToast(null);
    }
  };

  // Don't render anything if no current toast
  if (!currentToast) {
    return null;
  }

  const achievementData = ACHIEVEMENT_DATA[currentToast as keyof typeof ACHIEVEMENT_DATA];
  
  // Don't render if achievement data not found
  if (!achievementData) {
    console.warn(`Achievement data not found for: ${currentToast}`);
    handleClose();
    return null;
  }

  return (
    <AchievementToast
      id={currentToast}
      title={achievementData.title}
      description={achievementData.description}
      icon={achievementData.icon}
      progress={achievementData.progress}
      onView={handleView}
      onClose={handleClose}
      duration={4000} // 4 seconds
    />
  );
};

export default AchievementManager;