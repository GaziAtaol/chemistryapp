import React, { useEffect, useState } from 'react';
import { playButtonClickSound } from '../../utils/audio';

interface AchievementToastProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress?: string;
  onView: () => void;
  onClose: () => void;
  duration?: number; // milliseconds
}

const AchievementToast: React.FC<AchievementToastProps> = ({
  title,
  description,
  icon,
  progress,
  onView,
  onClose,
  duration = 4000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Slide in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto close after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleView = () => {
    playButtonClickSound();
    setIsClosing(true);
    setTimeout(() => {
      onView();
    }, 300);
  };

  const handleClose = () => {
    playButtonClickSound();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleView();
    }
  };

  return (
    <div
      className={`achievement-toast ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
      role="alert"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="achievement-toast-content">
        {/* Icon */}
        <div className="achievement-icon">
          <span className="achievement-emoji">{icon}</span>
          <div className="achievement-glow"></div>
        </div>

        {/* Content */}
        <div className="achievement-info">
          <h4 className="achievement-title">{title}</h4>
          <p className="achievement-description">{description}</p>
          {progress && (
            <div className="achievement-progress">
              <span className="progress-text">{progress}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="achievement-actions">
          <button
            onClick={handleView}
            className="btn btn-primary btn-sm"
            aria-label="Başarıları görüntüle"
          >
            Görüntüle
          </button>
          <button
            onClick={handleClose}
            className="btn btn-secondary btn-sm"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .achievement-toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          max-width: calc(100vw - 40px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transform: translateX(400px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 1000;
          border: 2px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .achievement-toast.visible {
          transform: translateX(0);
          opacity: 1;
        }

        .achievement-toast.closing {
          transform: translateX(400px) scale(0.9);
          opacity: 0;
        }

        .achievement-toast:focus {
          outline: 2px solid #ffd700;
          outline-offset: 2px;
        }

        .achievement-toast-content {
          display: flex;
          align-items: center;
          padding: 16px;
          gap: 12px;
        }

        .achievement-icon {
          position: relative;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .achievement-emoji {
          font-size: 32px;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .achievement-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .achievement-info {
          flex: 1;
          min-width: 0;
        }

        .achievement-title {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .achievement-description {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .achievement-progress {
          margin-top: 8px;
        }

        .progress-text {
          color: #ffd700;
          font-size: 12px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .achievement-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          min-width: 70px;
        }

        .btn-primary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-primary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: rgba(0, 0, 0, 0.2);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        .btn:focus {
          outline: 2px solid #ffd700;
          outline-offset: 1px;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .achievement-toast {
            width: 300px;
            bottom: 10px;
            right: 10px;
          }
          
          .achievement-toast-content {
            padding: 12px;
            gap: 10px;
          }
          
          .achievement-icon {
            width: 40px;
            height: 40px;
          }
          
          .achievement-emoji {
            font-size: 24px;
          }
        }
        `
      }} />
    </div>
  );
};

export default AchievementToast;