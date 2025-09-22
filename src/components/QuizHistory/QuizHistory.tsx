import React, { useState, useMemo } from 'react';
import { useQuiz } from '../../hooks';
import type { QuizSession } from '../../types';

const QuizHistory: React.FC = () => {
  const { quizSessions, calculateStats } = useQuiz();
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const stats = calculateStats();

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = quizSessions;

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(session => session.difficulty === filterDifficulty);
    }

    // Sort sessions
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.start_time.getTime() - a.start_time.getTime();
        case 'score':
          return b.score - a.score;
        case 'duration':
          const durationA = a.end_time ? a.end_time.getTime() - a.start_time.getTime() : 0;
          const durationB = b.end_time ? b.end_time.getTime() - b.start_time.getTime() : 0;
          return durationB - durationA;
        default:
          return 0;
      }
    });

    return sorted;
  }, [quizSessions, filterDifficulty, sortBy]);

  const formatDuration = (start: Date, end?: Date): string => {
    if (!end) return '-';
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDifficultyLabel = (difficulty: string): string => {
    const labels = {
      'beginner': 'Başlangıç',
      'easy': 'Kolay',
      'medium': 'Orta',
      'hard': 'Zor',
      'academic': 'Akademik'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (selectedSession) {
    return (
      <div className="quiz-container">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedSession(null)}
              className="btn btn-secondary"
            >
              ← Geri Dön
            </button>
            <h2 className="text-2xl font-bold">Quiz Detayları</h2>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Session Details */}
          <div className="quiz-question-card mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-brand">
                  {Math.round(selectedSession.score)}%
                </div>
                <div className="text-sm text-gray-600">Puan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {selectedSession.questions.length}
                </div>
                <div className="text-sm text-gray-600">Soru</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {getDifficultyLabel(selectedSession.difficulty)}
                </div>
                <div className="text-sm text-gray-600">Zorluk</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(selectedSession.start_time, selectedSession.end_time)}
                </div>
                <div className="text-sm text-gray-600">Süre</div>
              </div>
            </div>
          </div>

          {/* Questions and Answers */}
          <div className="space-y-4">
            {selectedSession.questions.map((question, index) => {
              const answer = selectedSession.answers.find(a => a.question_id === question.id);
              const isCorrect = answer?.correct ?? false;
              
              return (
                <div key={question.id} className="quiz-question-card">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{question.question_tr}</h4>
                      
                      {/* Multiple choice options */}
                      {question.options && (
                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optIndex) => {
                            const isUserAnswer = Array.isArray(answer?.answer) 
                              ? answer.answer.includes(option)
                              : answer?.answer === option;
                            const isCorrectAnswer = Array.isArray(question.correct_answer)
                              ? question.correct_answer.includes(option)
                              : question.correct_answer === option;
                            
                            return (
                              <div 
                                key={optIndex}
                                className={`p-2 rounded border ${
                                  isCorrectAnswer 
                                    ? 'bg-green-100 border-green-300' 
                                    : isUserAnswer 
                                      ? 'bg-red-100 border-red-300'
                                      : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <span className="text-sm">
                                  {String.fromCharCode(65 + optIndex)}) {option}
                                  {isCorrectAnswer && <span className="ml-2 text-green-600">✓</span>}
                                  {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-red-600">✗</span>}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation_tr && (
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="text-sm font-medium text-blue-800 mb-1">Açıklama:</div>
                          <div className="text-sm text-blue-700">{question.explanation_tr}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="max-w-6xl mx-auto p-6">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="quiz-question-card text-center">
            <div className="text-2xl font-bold text-brand">{stats.totalSessions}</div>
            <div className="text-sm text-gray-600">Toplam Quiz</div>
          </div>
          <div className="quiz-question-card text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.averageScore.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Ortalama Puan</div>
          </div>
          <div className="quiz-question-card text-center">
            <div className="text-2xl font-bold text-warning">
              {stats.bestScore}%
            </div>
            <div className="text-sm text-gray-600">En İyi Puan</div>
          </div>
          <div className="quiz-question-card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.averageTime / 60000)}dk
            </div>
            <div className="text-sm text-gray-600">Ortalama Süre</div>
          </div>
          <div className="quiz-question-card text-center">
            <div className={`text-2xl font-bold ${
              stats.improvementTrend > 0 ? 'text-green-600' : 
              stats.improvementTrend < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stats.improvementTrend > 0 ? '+' : ''}{stats.improvementTrend.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Gelişim Trendi</div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="quiz-question-card mb-6">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <label className="text-md font-semibold text-brand">Sırala:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input"
              >
                <option value="date">Tarihe Göre</option>
                <option value="score">Puana Göre</option>
                <option value="duration">Süreye Göre</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-md font-semibold text-brand">Zorluk:</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="input"
              >
                <option value="all">Tümü</option>
                <option value="beginner">Başlangıç</option>
                <option value="easy">Kolay</option>
                <option value="medium">Orta</option>
                <option value="hard">Zor</option>
                <option value="academic">Akademik</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Sessions List */}
        {filteredAndSortedSessions.length === 0 ? (
          <div className="quiz-question-card text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Henüz Quiz Geçmişiniz Yok</h3>
            <p className="text-gray-600 mb-6">
              İlk quiz'inizi çözdükten sonra burada geçmiş performansınızı görebileceksiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedSessions.map((session) => (
              <div
                key={session.id}
                className="quiz-question-card hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-brand/5 hover:to-accent/5 hover:border-brand/50 group"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-md ${getScoreColor(session.score)}`}>
                      {Math.round(session.score)}%
                    </div>
                    <div className="group-hover:text-brand transition-all duration-300 group-hover:translate-x-1">
                      <div className="font-semibold">
                        {getDifficultyLabel(session.difficulty)} Quiz
                      </div>
                      <div className="text-sm text-gray-600 group-hover:text-brand/70">
                        {formatDate(session.start_time)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="text-center group-hover:text-brand transition-all duration-300 group-hover:scale-105 group-hover:font-semibold">
                      <div className="font-medium">{session.questions.length}</div>
                      <div>Soru</div>
                    </div>
                    <div className="text-center group-hover:text-brand transition-all duration-300 group-hover:scale-105 group-hover:font-semibold">
                      <div className="font-medium">
                        {formatDuration(session.start_time, session.end_time)}
                      </div>
                      <div>Süre</div>
                    </div>
                    <div className="text-center group-hover:text-brand transition-all duration-300 group-hover:scale-105 group-hover:font-semibold">
                      <div className="font-medium">
                        {session.answers.filter(a => a.correct).length}
                      </div>
                      <div>Doğru</div>
                    </div>
                    <div className="text-blue-600 group-hover:text-brand transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-lg">
                      →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;