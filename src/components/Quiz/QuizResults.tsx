import React from 'react';
import type { QuizQuestion } from '../../types';
import type { QuizResults as QuizResultsType } from '../Quiz/QuizTaking';

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
    <div className="max-w-4xl mx-auto p-6">
      {/* Main Results */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Quiz Sonuçları</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}%
          </div>
          <p className="text-xl text-gray-600 mb-4">{getScoreMessage(score)}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Doğru Cevap</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-gray-600">Yanlış Cevap</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatTime(timeTaken)}</div>
              <div className="text-sm text-gray-600">Toplam Süre</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Soru Detayları</h3>
        <div className="space-y-4">
          {questions.map((question, index) => {
            const answer = answers.find((a: { questionId: string; userAnswer: string | string[]; correct: boolean; timeTaken: number; }) => a.questionId === question.id);
            const isCorrect = answer?.correct || false;
            
            return (
              <div
                key={question.id}
                className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Soru {index + 1}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isCorrect ? 'Doğru' : 'Yanlış'}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-2">{question.question_tr}</p>
                
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Cevabınız: </span>
                    <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {answer?.userAnswer || 'Cevaplanmadı'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div>
                      <span className="font-medium">Doğru cevap: </span>
                      <span className="text-green-700">
                        {Array.isArray(question.correct_answer) 
                          ? question.correct_answer.join(', ') 
                          : question.correct_answer}
                      </span>
                    </div>
                  )}
                  {question.explanation_tr && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                      <span className="font-medium">Açıklama: </span>
                      {question.explanation_tr}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRetakeQuiz}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium"
        >
          Tekrar Çöz
        </button>
        <button
          onClick={onBackToConfig}
          className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 font-medium"
        >
          Yeni Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResults;