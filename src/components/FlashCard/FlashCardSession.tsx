import React, { useState, useEffect, useCallback } from 'react';
import type { Element } from '../../types';
import { useSettings } from '../../hooks';
import { playButtonClickSound, playNextQuestionSound } from '../../utils/audio';
import {
  loadFlashcardSession,
  getRandomUnshownElement,
  markElementAsShown,
  isDailyTargetReached,
  getSessionProgress
} from '../../utils/flashcardSession';

interface FlashCardSessionProps {
  onSessionComplete: () => void;
}

type CardState = 'symbol' | 'atomic-number' | 'full-details';

const FlashCardSession: React.FC<FlashCardSessionProps> = ({ onSessionComplete }) => {
  const { settings } = useSettings();
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [cardState, setCardState] = useState<CardState>('symbol');
  const [session, setSession] = useState(() => loadFlashcardSession());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Load initial element
  useEffect(() => {
    if (!currentElement && !isDailyTargetReached(session)) {
      const element = getRandomUnshownElement(session);
      if (element) {
        setCurrentElement(element);
      } else {
        onSessionComplete(); // No more elements available
      }
    }
  }, [currentElement, session, onSessionComplete]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleNextStep();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (cardState === 'full-details') {
          handleNextStep();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cardState]);

  const handleNextStep = useCallback(() => {
    if (!currentElement || isTransitioning) return;

    playButtonClickSound();

    if (cardState === 'symbol') {
      setCardState('atomic-number');
    } else if (cardState === 'atomic-number') {
      setCardState('full-details');
    } else if (cardState === 'full-details') {
      // Move to next card
      setIsTransitioning(true);
      
      // Mark current element as shown
      const updatedSession = markElementAsShown(currentElement.z);
      setSession(updatedSession);
      
      // Check if target reached
      if (isDailyTargetReached(updatedSession)) {
        setTimeout(() => {
          playNextQuestionSound();
          onSessionComplete();
        }, 300);
        return;
      }

      // Get next element
      setTimeout(() => {
        const nextElement = getRandomUnshownElement(updatedSession);
        if (nextElement) {
          setCurrentElement(nextElement);
          setCardState('symbol');
          setIsTransitioning(false);
          playNextQuestionSound();
        } else {
          onSessionComplete(); // No more elements
        }
      }, 500);
    }
  }, [currentElement, cardState, isTransitioning, onSessionComplete]);

  const handleCardClick = useCallback(() => {
    handleNextStep();
  }, [handleNextStep]);

  const progress = getSessionProgress(session);

  if (!currentElement) {
    return (
      <div className="flashcard-container">
        <div className="quiz-question-card">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 text-brand">
              {progress.completed > 0 ? 'Tebrikler!' : 'Başlamaya hazır?'}
            </h2>
            <p className="text-muted">
              {progress.completed > 0 
                ? `Bugün ${progress.completed} element öğrendiniz!`
                : 'İlk kartınızı görmek için hazır olun.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-container">
      {/* Progress indicator */}
      <div className="flashcard-progress">
        <div className="progress-info">
          <span className="text-sm text-muted">
            {progress.completed} / {progress.target} kart ({progress.percentage}%)
          </span>
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="progress-toggle"
            aria-label="Progress detaylarını göster"
          >
            📊
          </button>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        {showProgress && (
          <div className="progress-details animate-fade-in">
            <div className="text-xs text-muted">
              Kalan: {progress.remaining} kart
            </div>
          </div>
        )}
      </div>

      {/* Main flashcard */}
      <div 
        className={`flashcard ${isTransitioning ? 'transitioning' : ''}`}
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        aria-label={`Element kartı: ${currentElement.symbol}. Enter tuşuna basın veya tıklayın.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Element Symbol - Always visible */}
        <div className="flashcard-symbol">
          {currentElement.symbol}
        </div>

        {/* Atomic Number - Visible after first Enter */}
        {cardState !== 'symbol' && (
          <div className="flashcard-atomic-number animate-fade-scale-in">
            <span className="atomic-number-label">Atom Numarası</span>
            <span className="atomic-number-value">{currentElement.z}</span>
          </div>
        )}

        {/* Full Details - Visible after second Enter */}
        {cardState === 'full-details' && (
          <div className="flashcard-details animate-stagger-fade-in">
            <div className="detail-row" style={{ animationDelay: '0.1s' }}>
              <span className="detail-label">İsim:</span>
              <span className="detail-value">
                {settings.language === 'tr' ? currentElement.name_tr : currentElement.name_en}
              </span>
            </div>
            
            <div className="detail-row" style={{ animationDelay: '0.2s' }}>
              <span className="detail-label">Grup/Periyot:</span>
              <span className="detail-value">
                {currentElement.group ? `${currentElement.group}/${currentElement.period}` : `—/${currentElement.period}`}
              </span>
            </div>
            
            <div className="detail-row" style={{ animationDelay: '0.3s' }}>
              <span className="detail-label">Atomik Kütle:</span>
              <span className="detail-value">{currentElement.mass.toFixed(3)} u</span>
            </div>
            
            <div className="detail-row" style={{ animationDelay: '0.4s' }}>
              <span className="detail-label">Elektron Dizilimi:</span>
              <span className="detail-value">{currentElement.electron_config}</span>
            </div>
            
            <div className="detail-row" style={{ animationDelay: '0.5s' }}>
              <span className="detail-label">Oda Koşulunda:</span>
              <span className="detail-value">
                {currentElement.phase_at_stp === 'solid' ? 'Katı' : 
                 currentElement.phase_at_stp === 'liquid' ? 'Sıvı' : 'Gaz'}
              </span>
            </div>
            
            {currentElement.density && (
              <div className="detail-row" style={{ animationDelay: '0.6s' }}>
                <span className="detail-label">Yoğunluk:</span>
                <span className="detail-value">{currentElement.density} g/cm³</span>
              </div>
            )}
            
            {currentElement.melting_point && (
              <div className="detail-row" style={{ animationDelay: '0.7s' }}>
                <span className="detail-label">Erime Noktası:</span>
                <span className="detail-value">{(currentElement.melting_point - 273.15).toFixed(1)}°C</span>
              </div>
            )}
            
            {currentElement.boiling_point && (
              <div className="detail-row" style={{ animationDelay: '0.8s' }}>
                <span className="detail-label">Kaynama Noktası:</span>
                <span className="detail-value">{(currentElement.boiling_point - 273.15).toFixed(1)}°C</span>
              </div>
            )}
            
            {currentElement.electronegativity && (
              <div className="detail-row" style={{ animationDelay: '0.9s' }}>
                <span className="detail-label">Elektronegatiflik:</span>
                <span className="detail-value">{currentElement.electronegativity}</span>
              </div>
            )}
          </div>
        )}

        {/* Instruction hint */}
        <div className="flashcard-hint">
          {cardState === 'symbol' && '⏎ Atom numarasını göster'}
          {cardState === 'atomic-number' && '⏎ Tüm özellikleri göster'}
          {cardState === 'full-details' && '⏎ Sonraki karta geç'}
        </div>
      </div>

      {/* Instructions */}
      <div className="flashcard-instructions">
        <div className="instruction-item">
          <kbd>Enter</kbd> veya <strong>tıklama</strong> ile ilerle
        </div>
        <div className="instruction-item">
          <kbd>→</kbd> Sonraki karta geç (detaylar açıkken)
        </div>
      </div>
    </div>
  );
};

export default FlashCardSession;