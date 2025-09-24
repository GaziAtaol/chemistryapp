import React, { useState } from 'react';
import { t } from '../../utils/i18n';
import type { Achievement, UserAchievement } from '../../types';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement: UserAchievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  userAchievement 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isUnlocked = userAchievement.unlocked;
  const progress = userAchievement.progress;
  const currentValue = userAchievement.current_value;
  const targetValue = achievement.target_value;

  const handleCardClick = () => {
    setShowTooltip(!showTooltip);
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressText = () => {
    if (isUnlocked) {
      return `${targetValue}/${targetValue}`;
    }
    
    // Special handling for percentage-based achievements
    if (achievement.id === 'high-score' || achievement.id === 'perfectionist') {
      return `%${currentValue}`;
    }
    
    return `${currentValue}/${targetValue}`;
  };

  return (
    <div 
      className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Achievement Icon */}
      <div className="achievement-icon-container">
        <div className={`achievement-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
          {achievement.icon}
        </div>
        {isUnlocked && (
          <div className="achievement-glow"></div>
        )}
      </div>

      {/* Achievement Info */}
      <div className="achievement-info">
        <h3 className="achievement-name">
          {t(achievement.name_key)}
        </h3>
        <p className="achievement-description">
          {t(achievement.description_key)}
        </p>
        
        {/* Progress Bar */}
        <div className="achievement-progress">
          <div className="progress-bar-container">
            <div 
              className={`progress-bar ${isUnlocked ? 'completed' : ''}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="progress-text">
            {getProgressText()}
          </div>
        </div>

        {/* Unlock Date */}
        {isUnlocked && userAchievement.unlock_date && (
          <div className="unlock-date">
            <span className="unlock-date-icon">🗓️</span>
            {formatDate(userAchievement.unlock_date)}
          </div>
        )}
      </div>

      {/* Tooltip for detailed info */}
      {showTooltip && (
        <div className="achievement-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-icon">{achievement.icon}</span>
            <span className="tooltip-title">{t(achievement.name_key)}</span>
          </div>
          <div className="tooltip-content">
            <p>{t(achievement.description_key)}</p>
            <div className="tooltip-stats">
              <div className="stat-item">
                <span className="stat-label">İlerleme:</span>
                <span className="stat-value">%{Math.round(progress)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Durum:</span>
                <span className={`stat-value ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  {isUnlocked ? 'Açıldı' : 'Kilitli'}
                </span>
              </div>
              {isUnlocked && userAchievement.unlock_date && (
                <div className="stat-item">
                  <span className="stat-label">Açılış:</span>
                  <span className="stat-value">{formatDate(userAchievement.unlock_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for tooltip */}
      {showTooltip && (
        <div 
          className="tooltip-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(false);
          }}
        />
      )}
    </div>
  );
};

export default AchievementCard;