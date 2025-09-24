import React from 'react';
import { getSessionProgress } from '../../utils/flashcardSession';
import { playButtonClickSound } from '../../utils/audio';

interface SessionCompleteProps {
  onRestart: () => void;
}

const SessionComplete: React.FC<SessionCompleteProps> = ({ onRestart }) => {
  const progress = getSessionProgress();

  const handleRestart = () => {
    playButtonClickSound();
    onRestart();
  };

  const completionEmoji = progress.percentage >= 100 ? '🎉' : '✨';
  const completionMessage = progress.percentage >= 100 
    ? 'Bugünlük hedefi tamamladınız!'
    : `${progress.completed} element öğrendiniz!`;

  return (
    <div className="flashcard-container">
      <div className="quiz-question-card session-complete">
        <div className="text-center">
          <div className="completion-icon">
            {completionEmoji}
          </div>
          
          <h2 className="completion-title">
            Tebrikler!
          </h2>
          
          <p className="completion-message">
            {completionMessage}
          </p>

          <div className="completion-stats">
            <div className="stat-item">
              <div className="stat-value">{progress.completed}</div>
              <div className="stat-label">Kart Çalışıldı</div>
            </div>
            <div className="stat-divider">•</div>
            <div className="stat-item">
              <div className="stat-value">{progress.percentage}%</div>
              <div className="stat-label">Günlük Hedef</div>
            </div>
            {progress.remaining > 0 && (
              <>
                <div className="stat-divider">•</div>
                <div className="stat-item">
                  <div className="stat-value">{progress.remaining}</div>
                  <div className="stat-label">Kalan</div>
                </div>
              </>
            )}
          </div>

          {progress.percentage >= 100 ? (
            <div className="completion-full">
              <div className="celebration-text">
                🏆 Günlük hedefinizi tamamladınız!
              </div>
              <div className="next-session-info">
                Yarın yeni kartlarla devam edebilirsiniz.
              </div>
            </div>
          ) : (
            <div className="completion-partial">
              <div className="continue-info">
                Daha fazla element öğrenmek ister misiniz?
              </div>
              <button 
                onClick={handleRestart}
                className="btn btn-primary continue-btn"
              >
                Devam Et ({progress.remaining} kart kaldı)
              </button>
            </div>
          )}

          <div className="completion-tips">
            <div className="tip-title">💡 İpucu</div>
            <div className="tip-text">
              Düzenli çalışma hafızayı güçlendirir. Ayarlardan günlük kart sayısını değiştirebilirsiniz.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionComplete;