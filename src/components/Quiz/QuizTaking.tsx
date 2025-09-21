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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{questionText}</h3>
            <div className="space-y-2">
              {currentQuestion.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{questionText}</h3>
            <div className="space-y-2">
              {['Doğru', 'Yanlış'].map((option) => (
                <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'fill-blank':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{questionText}</h3>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Cevabınızı buraya yazın..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">{questionText}</h3>
            <p className="text-gray-500">Bu soru tipi henüz desteklenmiyor.</p>
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Quiz</h2>
          <p className="text-gray-600">
            Soru {currentQuestionIndex + 1} / {questions.length}
          </p>
        </div>
        <div className="text-right">
          {timeRemaining !== undefined && (
            <div className="text-lg font-semibold">
              <span className={timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}>
                Kalan Süre: {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {renderQuestionContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBackToConfig}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Quiz'i Bırak
        </button>

        <div className="space-x-3">
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Önceki
            </button>
          )}
          <button
            onClick={handleSubmitAnswer}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            {isLastQuestion ? 'Quiz\'i Bitir' : 'Sonraki'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;