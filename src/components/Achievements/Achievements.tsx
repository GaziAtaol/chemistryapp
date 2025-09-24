import React, { useState, useEffect } from 'react';
import { t } from '../../utils/i18n';
import { getAllAchievementsWithProgress, getAchievementStats, updateAchievements } from '../../utils/achievements';
import type { Achievement, UserAchievement } from '../../types';
import AchievementCard from './AchievementCard';
import PageContainer from '../PageContainer/PageContainer';

const Achievements: React.FC = () => {
  const [achievementsData, setAchievementsData] = useState<Array<{
    achievement: Achievement;
    userAchievement: UserAchievement;
  }>>([]);
  const [stats, setStats] = useState<{
    totalAchievements: number;
    unlockedAchievements: number;
    overallProgress: number;
    categoryStats: Array<{
      category: string;
      total: number;
      unlocked: number;
      progress: number;
    }>;
  }>({
    totalAchievements: 0,
    unlockedAchievements: 0,
    overallProgress: 0,
    categoryStats: []
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load achievements data
  useEffect(() => {
    const loadAchievements = () => {
      // Update achievements progress
      updateAchievements();
      
      // Get all achievements with progress
      const data = getAllAchievementsWithProgress();
      setAchievementsData(data);
      
      // Get stats
      const achievementStats = getAchievementStats();
      setStats(achievementStats);
    };

    loadAchievements();
  }, []);

  // Filter achievements by category
  const filteredAchievements = achievementsData.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return item.userAchievement.unlocked;
    if (selectedCategory === 'locked') return !item.userAchievement.unlocked;
    return item.achievement.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'Tümü', icon: '🏆' },
    { id: 'unlocked', label: 'Açılanlar', icon: '✅' },
    { id: 'locked', label: 'Kilitli', icon: '🔒' },
    { id: 'flashcards', label: 'Kartlar', icon: '🃏' },
    { id: 'quiz', label: 'Quiz', icon: '🎯' },
    { id: 'consistency', label: 'Süreklilik', icon: '📅' },
    { id: 'exploration', label: 'Keşif', icon: '🔍' },
    { id: 'mastery', label: 'Ustalık', icon: '👑' }
  ];

  return (
    <PageContainer title={t('achievements.page-title')}>
      {/* Achievement Stats Header */}
      <div className="card-glass mb-6">
        <div className="p-6">
          <p className="text-center text-muted mb-4">
            {t('achievements.subtitle')}
          </p>
          
          {/* Overall Progress */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-4">
              <div className="text-3xl font-bold text-brand">
                {stats.unlockedAchievements}/{stats.totalAchievements}
              </div>
              <div className="flex-1 min-w-48">
                <div className="quiz-progress-bar">
                  <div 
                    className="quiz-progress-fill"
                    style={{ width: `${stats.overallProgress}%` }}
                  >
                    <div className="progress-glow"></div>
                  </div>
                </div>
                <div className="text-sm text-muted mt-1">
                  %{Math.round(stats.overallProgress)} Tamamlandı
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="achievements-grid">
        {filteredAchievements.map(({ achievement, userAchievement }) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            userAchievement={userAchievement}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-muted mb-2">
            Bu kategoride başarı bulunamadı
          </h3>
          <p className="text-muted">
            Farklı bir kategori seçmeyi deneyin.
          </p>
        </div>
      )}
    </PageContainer>
  );
};

export default Achievements;