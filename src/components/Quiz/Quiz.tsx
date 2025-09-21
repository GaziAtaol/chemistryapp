import React, { useState } from 'react';
import { t } from '../../utils/i18n';
import QuizConfigComponent, { type QuizConfig } from './QuizConfig';

type QuizState = 'config' | 'taking' | 'results';

const Quiz: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>('config');
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null);

  const getDifficultyLabel = (difficulty: QuizConfig['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return t('quiz.difficulty.beginner');
      case 'easy': return t('quiz.difficulty.easy');
      case 'medium': return t('quiz.difficulty.medium');
      case 'hard': return t('quiz.difficulty.hard');
      case 'academic': return t('quiz.difficulty.academic');
      default: return difficulty;
    }
  };

  const handleStartQuiz = (config: QuizConfig) => {
    setCurrentConfig(config);
    setQuizState('taking');
    // TODO: Generate questions and start quiz
    console.log('Starting quiz with config:', config);
  };

  const handleCancelConfig = () => {
    setQuizState('config');
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
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Quiz alınıyor...</h2>
            <p className="text-gray-600 mb-6">Quiz soruları yakında eklenecek!</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Mevcut Ayarlar:</h3>
              <ul className="text-left space-y-1">
                <li><strong>Zorluk:</strong> {currentConfig?.difficulty && getDifficultyLabel(currentConfig.difficulty)}</li>
                <li><strong>Soru Sayısı:</strong> {currentConfig?.questionCount}</li>
                <li><strong>Süre Sınırı:</strong> {currentConfig?.timeLimit ? `${currentConfig.timeLimit} dakika` : 'Yok'}</li>
                <li><strong>Soru Tipleri:</strong> {currentConfig?.questionTypes.length} tip seçildi</li>
              </ul>
            </div>
            <button
              onClick={() => setQuizState('config')}
              className="mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Geri Dön
            </button>
          </div>
        );
      case 'results':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Quiz Sonuçları</h2>
            <p>Quiz sonuçları yakında eklenecek!</p>
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