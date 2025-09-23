import React, { useEffect } from 'react';
import type { QuizQuestion } from '../../types';
import type { QuizResults as QuizResultsType } from '../Quiz/QuizTaking';
import { playQuizSuccessSound, playButtonClickSound } from '../../utils/audio';

interface QuizResultsProps {
  results: QuizResultsType;
  questions: QuizQuestion[];
  onRetakeQuiz: () => void;
  onBackToConfig: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  results,
  questions,
  onRetakeQuiz,
  onBackToConfig
}) => {
  const { score, totalQuestions, correctAnswers, timeTaken, answers } = results;
  
  // Play success sound for good scores
  useEffect(() => {
    if (score >= 70) {
      // Small delay to let the component render first
      const timer = setTimeout(() => {
        playQuizSuccessSound();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [score]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Mükemmel! 🎉';
    if (score >= 70) return 'Çok iyi! 👏';
    if (score >= 50) return 'İyi! 👍';
    return 'Daha çok çalışmalısın! 📚';
  };

  return (
    <div className="quiz-container">
      {/* Animated Background */}
      <div className="quiz-bg-particles"></div>
      
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Main Results */}
        <div className="quiz-results-header">
          <h2 className="results-title">🏆 Quiz Sonuçları</h2>
          <div className="results-main-card">
            <div className={`results-score ${getScoreColor(score).replace('text-', 'score-')}`}>
              <div className="score-circle">
                <svg className="score-progress" viewBox="0 0 100 100">
                  <circle
                    className="score-track"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                  />
                  <circle
                    className="score-fill"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={`${score * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">{score}</span>
                  <span className="score-percent">%</span>
                </div>
              </div>
            </div>
            <p className="results-message">{getScoreMessage(score)}</p>
            
            <div className="results-stats-grid">
              <div className="stat-card stat-correct">
                <div className="stat-icon">✅</div>
                <div className="stat-number">{correctAnswers}</div>
                <div className="stat-label">Doğru Cevap</div>
              </div>
              <div className="stat-card stat-incorrect">
                <div className="stat-icon">❌</div>
                <div className="stat-number">{totalQuestions - correctAnswers}</div>
                <div className="stat-label">Yanlış Cevap</div>
              </div>
              <div className="stat-card stat-time">
                <div className="stat-icon">⏱️</div>
                <div className="stat-number">{formatTime(timeTaken)}</div>
                <div className="stat-label">Toplam Süre</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="results-details">
          <h3 className="details-title">📝 Soru Detayları</h3>
          <div className="questions-review">
            {questions.map((question, index) => {
              const answer = answers.find((a: { questionId: string; userAnswer: string | string[]; correct: boolean; timeTaken: number; }) => a.questionId === question.id);
              const isCorrect = answer?.correct || false;
              
              return (
                <div
                  key={question.id}
                  className={`question-review-card ${isCorrect ? 'question-correct' : 'question-incorrect'}`}
                >
                  <div className="question-review-header">
                    <div className="question-number">
                      Soru {index + 1}
                    </div>
                    <div className={`question-result-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                      <span className="badge-icon">{isCorrect ? '✓' : '✗'}</span>
                      <span className="badge-text">{isCorrect ? 'Doğru' : 'Yanlış'}</span>
                    </div>
                  </div>
                  
                  <div className="question-review-content">
                    <p className="question-text">{question.question_tr}</p>
                    
                    <div className="answer-details">
                      <div className="answer-row">
                        <span className="answer-label">Cevabınız:</span>
                        <span className={`answer-value ${isCorrect ? 'answer-correct' : 'answer-incorrect'}`}>
                          {answer?.userAnswer || 'Cevaplanmadı'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="answer-row">
                          <span className="answer-label">Doğru cevap:</span>
                          <span className="answer-value answer-correct">
                            {Array.isArray(question.correct_answer) 
                              ? question.correct_answer.join(', ') 
                              : question.correct_answer}
                          </span>
                        </div>
                      )}
                      {question.explanation_tr && (
                        <div className="explanation-box">
                          <div className="explanation-header">
                            <span className="explanation-icon">💡</span>
                            <span className="explanation-label">Açıklama:</span>
                          </div>
                          <p className="explanation-text">{question.explanation_tr}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button
            onClick={() => {
              playButtonClickSound();
              onRetakeQuiz();
            }}
            className="btn btn-primary quiz-btn-retake"
          >
            <span>🔄</span>
            Tekrar Çöz
          </button>
          <button
            onClick={() => {
              playButtonClickSound();
              onBackToConfig();
            }}
            className="btn quiz-btn-new-quiz"
          >
            <span>✨</span>
            Yeni Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;