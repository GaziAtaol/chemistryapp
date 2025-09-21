import React, { useState } from 'react';
import { t } from '../../utils/i18n';
import type { QuestionType } from '../../types';

export interface QuizConfig {
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'academic';
  questionCount: number;
  timeLimit?: number; // in minutes
  questionTypes: QuestionType[];
}

interface QuizConfigProps {
  onStartQuiz: (config: QuizConfig) => void;
  onCancel: () => void;
}

const QuizConfigComponent: React.FC<QuizConfigProps> = ({ onStartQuiz, onCancel }) => {
  const [difficulty, setDifficulty] = useState<QuizConfig['difficulty']>('easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([
    'multiple-choice',
    'true-false',
    'fill-blank'
  ]);

  const difficultyOptions = [
    { value: 'beginner' as const, label: t('quiz.difficulty.beginner') },
    { value: 'easy' as const, label: t('quiz.difficulty.easy') },
    { value: 'medium' as const, label: t('quiz.difficulty.medium') },
    { value: 'hard' as const, label: t('quiz.difficulty.hard') },
    { value: 'academic' as const, label: t('quiz.difficulty.academic') }
  ];

  const questionTypeOptions = [
    { value: 'multiple-choice' as const, label: t('quiz.multiple-choice') },
    { value: 'true-false' as const, label: t('quiz.true-false') },
    { value: 'fill-blank' as const, label: t('quiz.fill-blank') },
    { value: 'matching' as const, label: t('quiz.matching') },
    { value: 'electron-config' as const, label: t('quiz.electron-config') },
    { value: 'periodic-trend' as const, label: t('quiz.periodic-trend') },
    { value: 'naming' as const, label: t('quiz.naming') },
    { value: 'property-comparison' as const, label: t('quiz.property-comparison') },
    { value: 'classification' as const, label: t('quiz.classification') },
    { value: 'calculation' as const, label: t('quiz.calculation') }
  ];

  const timeLimitOptions = [
    { value: undefined, label: t('quiz.no-time-limit') },
    { value: 5, label: `5 ${t('quiz.minutes')}` },
    { value: 10, label: `10 ${t('quiz.minutes')}` },
    { value: 15, label: `15 ${t('quiz.minutes')}` },
    { value: 20, label: `20 ${t('quiz.minutes')}` },
    { value: 30, label: `30 ${t('quiz.minutes')}` }
  ];

  const handleQuestionTypeToggle = (type: QuestionType) => {
    setSelectedQuestionTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleStartQuiz = () => {
    if (selectedQuestionTypes.length === 0) {
      alert('En az bir soru tipi seçmelisiniz.');
      return;
    }

    const config: QuizConfig = {
      difficulty,
      questionCount,
      timeLimit,
      questionTypes: selectedQuestionTypes
    };

    onStartQuiz(config);
  };

  return (
    <div className="quiz-container">
      {/* Animated Background */}
      <div className="quiz-bg-particles"></div>
      
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="quiz-header card-glass mb-6">
          <div className="flex justify-center items-center">
            <div className="quiz-info text-center">
              <h2 className="text-3xl font-bold text-brand mb-2 animate-fade-in">
                ⚙️ {t('quiz.config')}
              </h2>
              <p className="text-muted text-lg">
                Quiz ayarlarınızı yapılandırın
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="quiz-question-card">
          <div className="space-y-6">
            {/* Difficulty Selection */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-brand">{t('quiz.difficulty')}</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuizConfig['difficulty'])}
                className="input"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-brand">{t('quiz.question-count')}</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="input"
              >
                {[5, 10, 15, 20, 25, 30].map(count => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-brand">
                {t('quiz.time-limit')} <span className="text-muted">({t('quiz.optional')})</span>
              </label>
              <select
                value={timeLimit || ''}
                onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                className="input"
              >
                {timeLimitOptions.map((option, index) => (
                  <option key={index} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-brand">{t('quiz.question-types')}</label>
              <div className="grid grid-cols-2 gap-3">
                {questionTypeOptions.map(option => (
                  <label key={option.value} className="option-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedQuestionTypes.includes(option.value)}
                      onChange={() => handleQuestionTypeToggle(option.value)}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text text-sm font-medium">{option.label}</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                ))}
              </div>
              <div className="text-center mt-4">
                <span className="quiz-counter">
                  Seçili: {selectedQuestionTypes.length} / {questionTypeOptions.length}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="quiz-navigation">
              <button
                onClick={onCancel}
                className="btn btn-danger quiz-btn-exit"
              >
                <span>❌</span>
                {t('common.cancel')}
              </button>

              <div className="quiz-nav-controls">
                <button
                  onClick={handleStartQuiz}
                  disabled={selectedQuestionTypes.length === 0}
                  className={`btn btn-primary quiz-btn-nav quiz-btn-next ${selectedQuestionTypes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>🚀</span>
                  {t('quiz.start')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizConfigComponent;