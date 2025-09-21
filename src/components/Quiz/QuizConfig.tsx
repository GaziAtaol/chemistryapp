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
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">{t('quiz.config')}</h2>
      
      <div className="space-y-6">
        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('quiz.difficulty')}</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuizConfig['difficulty'])}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium mb-2">{t('quiz.question-count')}</label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[5, 10, 15, 20, 25, 30].map(count => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </div>

        {/* Time Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('quiz.time-limit')} <span className="text-gray-500">({t('quiz.optional')})</span>
          </label>
          <select
            value={timeLimit || ''}
            onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium mb-2">{t('quiz.question-types')}</label>
          <div className="grid grid-cols-2 gap-2">
            {questionTypeOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuestionTypes.includes(option.value)}
                  onChange={() => handleQuestionTypeToggle(option.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Seçili: {selectedQuestionTypes.length} / {questionTypeOptions.length}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleStartQuiz}
            disabled={selectedQuestionTypes.length === 0}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {t('quiz.start')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 font-medium"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizConfigComponent;