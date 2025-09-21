import React, { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '../../types';

interface QuizTakingProps {
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  onFinishQuiz: (results: QuizResults) => void;
  onBackToConfig: () => void;
}

export interface QuizResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  answers: {
    questionId: string;
    userAnswer: string | string[];
    correct: boolean;
    timeTaken: number;
  }[];
}

const QuizTaking: React.FC<QuizTakingProps> = ({
  questions,
  timeLimit,
  onFinishQuiz,
  onBackToConfig
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : undefined);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleFinishQuiz = useCallback((finalAnswers = answers) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    let correctCount = 0;

    const detailedAnswers = questions.map(question => {
      const userAnswer = finalAnswers[question.id] || '';
      const isCorrect = checkAnswer(question, userAnswer);
      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        userAnswer,
        correct: isCorrect,
        timeTaken: 0 // Individual question timing would need more complex state tracking
      };
    });

    const results: QuizResults = {
      score: Math.round((correctCount / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTaken,
      answers: detailedAnswers
    };

    onFinishQuiz(results);
  }, [answers, startTime, questions, onFinishQuiz]);

  // Timer effect
  useEffect(() => {
    if (!timeLimit) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleFinishQuiz();
          return 0;
        }
        return prev ? prev - 1 : undefined;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, handleFinishQuiz]);

  // Reset current answer when question changes
  useEffect(() => {
    setCurrentAnswer(answers[currentQuestion?.id] as string || '');
  }, [currentQuestionIndex, currentQuestion?.id, answers]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) {
      alert('Lütfen bir cevap seçin veya girin.');
      return;
    }

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      handleFinishQuiz(newAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
    }
  };

  const checkAnswer = (question: QuizQuestion, userAnswer: string | string[]): boolean => {
    const correctAnswer = question.correct_answer;
    
    if (Array.isArray(correctAnswer)) {
      if (Array.isArray(userAnswer)) {
        return correctAnswer.every(answer => userAnswer.includes(answer)) &&
               userAnswer.every(answer => correctAnswer.includes(answer));
      }
      return correctAnswer.includes(userAnswer as string);
    }
    
    return (correctAnswer as string).toLowerCase().trim() === 
           (userAnswer as string).toLowerCase().trim();
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    const questionText = currentQuestion.question_tr;

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="question-multiple-choice">
            <h3 className="question-title">{questionText}</h3>
            <div className="options-grid">
              {currentQuestion.options?.map((option, index) => (
                <label key={index} className="option-card">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="option-input"
                  />
                  <div className="option-content">
                    <div className="option-indicator">
                      <div className="option-radio"></div>
                    </div>
                    <span className="option-text">{option}</span>
                  </div>
                  <div className="option-glow"></div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'true-false':
        return (
          <div className="question-true-false">
            <h3 className="question-title">{questionText}</h3>
            <div className="tf-options">
              {['Doğru', 'Yanlış'].map((option) => (
                <label key={option} className={`tf-option ${option === 'Doğru' ? 'tf-true' : 'tf-false'}`}>
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="tf-input"
                  />
                  <div className="tf-content">
                    <div className="tf-icon">
                      {option === 'Doğru' ? '✓' : '✗'}
                    </div>
                    <span className="tf-text">{option}</span>
                  </div>
                  <div className="tf-glow"></div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'fill-blank':
        return (
          <div className="question-fill-blank">
            <h3 className="question-title">{questionText}</h3>
            <div className="fill-blank-container">
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Cevabınızı buraya yazın..."
                className="fill-blank-input"
              />
              <div className="input-decoration">
                <div className="input-glow"></div>
                <div className="input-border"></div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="question-unsupported">
            <h3 className="question-title">{questionText}</h3>
            <div className="unsupported-message">
              <span className="unsupported-icon">🚧</span>
              <p className="text-muted">Bu soru tipi henüz desteklenmiyor.</p>
            </div>
          </div>
        );
    }
  };

  if (!questions.length) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Soru bulunamadı</h2>
        <p className="text-gray-600 mb-6">Quiz için soru oluşturulamadı.</p>
        <button
          onClick={onBackToConfig}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* Animated Background */}
      <div className="quiz-bg-particles"></div>
      
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="quiz-header card-glass mb-6">
          <div className="flex justify-between items-center">
            <div className="quiz-info">
              <h2 className="text-3xl font-bold text-brand mb-2 animate-fade-in">
                🧪 Quiz
              </h2>
              <p className="text-muted text-lg">
                Soru <span className="quiz-counter">{currentQuestionIndex + 1}</span> / {questions.length}
              </p>
            </div>
            <div className="text-right">
              {timeRemaining !== undefined && (
                <div className="quiz-timer">
                  <div className="timer-icon">⏱️</div>
                  <span className={`timer-text ${timeRemaining < 60 ? 'timer-warning' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress-container mb-8">
          <div className="quiz-progress-track">
            <div
              className="quiz-progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>
          <div className="progress-percentage">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </div>
        </div>

        {/* Question Content */}
        <div className="quiz-question-card">
          <div className="question-content">
            {renderQuestionContent()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="quiz-navigation">
          <button
            onClick={onBackToConfig}
            className="btn btn-danger quiz-btn-exit"
          >
            <span>🚪</span>
            Quiz'i Bırak
          </button>

          <div className="quiz-nav-controls">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="btn quiz-btn-nav quiz-btn-prev"
              >
                <span>←</span>
                Önceki
              </button>
            )}
            <button
              onClick={handleSubmitAnswer}
              className="btn btn-primary quiz-btn-nav quiz-btn-next"
            >
              {isLastQuestion ? (
                <>
                  <span>🏁</span>
                  Quiz'i Bitir
                </>
              ) : (
                <>
                  Sonraki
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;