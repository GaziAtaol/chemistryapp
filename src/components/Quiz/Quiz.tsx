import React, { useState } from 'react';
import { t } from '../../utils/i18n';
import QuizConfigComponent, { type QuizConfig } from './QuizConfig';
import QuizTaking, { type QuizResults } from './QuizTaking';
import QuizResultsComponent from './QuizResults';
import { generateQuestions } from '../../utils/questionGenerator';
import { syncQuizCompletion } from '../../utils/progressSync';
import type { QuizQuestion } from '../../types';

type QuizState = 'config' | 'taking' | 'results';

const Quiz: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>('config');
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  const handleStartQuiz = (config: QuizConfig) => {
    setCurrentConfig(config);
    
    // Generate questions based on config
    try {
      const questions = generateQuestions({
        difficulty: config.difficulty,
        questionCount: config.questionCount,
        questionTypes: config.questionTypes
      });
      
      setCurrentQuestions(questions);
      setQuizState('taking');
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Sorular oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleFinishQuiz = (results: QuizResults) => {
    setQuizResults(results);
    setQuizState('results');
    
    // Sync with progress store
    syncQuizCompletion(results);
  };

  const handleRetakeQuiz = () => {
    if (currentConfig) {
      handleStartQuiz(currentConfig);
    }
  };

  const handleCancelConfig = () => {
    setQuizState('config');
    setCurrentQuestions([]);
    setQuizResults(null);
  };

  const renderContent = () => {
    switch (quizState) {
      case 'config':
        return (
          <QuizConfigComponent
            onStartQuiz={handleStartQuiz}
            onCancel={handleCancelConfig}
          />
        );
      case 'taking':
        return (
          <QuizTaking
            questions={currentQuestions}
            timeLimit={currentConfig?.timeLimit}
            onFinishQuiz={handleFinishQuiz}
            onBackToConfig={handleCancelConfig}
          />
        );
      case 'results':
        return quizResults ? (
          <QuizResultsComponent
            results={quizResults}
            questions={currentQuestions}
            onRetakeQuiz={handleRetakeQuiz}
            onBackToConfig={handleCancelConfig}
          />
        ) : (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Quiz Sonuçları</h2>
            <p>Sonuçlar yüklenirken bir hata oluştu.</p>
            <button
              onClick={handleCancelConfig}
              className="mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Geri Dön
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('quiz.title')}</h1>
      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Quiz;