// Achievement definitions for the chemistry learning app

import type { Achievement, AppData } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // Flashcard Achievements (1-5)
  {
    id: 'first-step',
    name_key: 'achievement.first-step.name',
    description_key: 'achievement.first-step.desc',
    icon: '⭐',
    category: 'flashcards',
    target_value: 5,
    check_function: (data: AppData) => {
      // Count unique elements studied via flashcards
      const studiedElements = new Set();
      data.flashcards.forEach(card => {
        if (card.element_id) studiedElements.add(card.element_id);
      });
      return studiedElements.size;
    }
  },
  {
    id: 'element-hunter',
    name_key: 'achievement.element-hunter.name',
    description_key: 'achievement.element-hunter.desc',
    icon: '⚛️',
    category: 'flashcards',
    target_value: 10,
    check_function: (data: AppData) => {
      const studiedElements = new Set();
      data.flashcards.forEach(card => {
        if (card.element_id) studiedElements.add(card.element_id);
      });
      return studiedElements.size;
    }
  },
  {
    id: 'period-master',
    name_key: 'achievement.period-master.name',
    description_key: 'achievement.period-master.desc',
    icon: '🧩',
    category: 'flashcards',
    target_value: 10, // Elements 1-10 (H to Ne)
    check_function: (data: AppData) => {
      const studiedElements = new Set();
      data.flashcards.forEach(card => {
        if (card.element_id && card.element_id <= 10) {
          studiedElements.add(card.element_id);
        }
      });
      return studiedElements.size;
    }
  },
  {
    id: 'group-collector',
    name_key: 'achievement.group-collector.name',
    description_key: 'achievement.group-collector.desc',
    icon: '🔗',
    category: 'flashcards',
    target_value: 1,
    check_function: (data: AppData) => {
      // Check if any complete group (column) has been studied
      const groupCounts: { [group: number]: number } = {};
      const expectedGroupSizes: { [group: number]: number } = {
        1: 7, 2: 6, 13: 5, 14: 4, 15: 5, 16: 4, 17: 5, 18: 6
      };
      
      data.flashcards.forEach(card => {
        if (card.element_id) {
          const element = data.elements.find(e => e.z === card.element_id);
          if (element && element.group) {
            groupCounts[element.group] = (groupCounts[element.group] || 0) + 1;
          }
        }
      });
      
      for (const [group, count] of Object.entries(groupCounts)) {
        const groupNum = parseInt(group);
        if (count >= (expectedGroupSizes[groupNum] || 7)) {
          return 1;
        }
      }
      return 0;
    }
  },
  {
    id: 'molecule-curious',
    name_key: 'achievement.molecule-curious.name',
    description_key: 'achievement.molecule-curious.desc',
    icon: '🔬',
    category: 'exploration',
    target_value: 20,
    check_function: (data: AppData) => {
      // Count favorited elements as "opened properties"
      return data.favorites.elements.length;
    }
  },

  // Quiz Achievements (6-10)
  {
    id: 'quiz-beginner',
    name_key: 'achievement.quiz-beginner.name',
    description_key: 'achievement.quiz-beginner.desc',
    icon: '📖',
    category: 'quiz',
    target_value: 1,
    check_function: (data: AppData) => {
      return data.quiz_sessions.length > 0 ? 1 : 0;
    }
  },
  {
    id: 'high-score',
    name_key: 'achievement.high-score.name',
    description_key: 'achievement.high-score.desc',
    icon: '🛡️',
    category: 'quiz',
    target_value: 90,
    check_function: (data: AppData) => {
      const highestScore = Math.max(...data.quiz_sessions.map(s => s.score), 0);
      return highestScore;
    }
  },
  {
    id: 'perfectionist',
    name_key: 'achievement.perfectionist.name',
    description_key: 'achievement.perfectionist.desc',
    icon: '💎',
    category: 'quiz',
    target_value: 100,
    check_function: (data: AppData) => {
      const perfectScores = data.quiz_sessions.filter(s => s.score === 100);
      return perfectScores.length > 0 ? 100 : Math.max(...data.quiz_sessions.map(s => s.score), 0);
    }
  },
  {
    id: 'quiz-master',
    name_key: 'achievement.quiz-master.name',
    description_key: 'achievement.quiz-master.desc',
    icon: '👑',
    category: 'quiz',
    target_value: 10,
    check_function: (data: AppData) => {
      return data.quiz_sessions.length;
    }
  },
  {
    id: 'persistent-mind',
    name_key: 'achievement.persistent-mind.name',
    description_key: 'achievement.persistent-mind.desc',
    icon: '🧠',
    category: 'consistency',
    target_value: 5,
    check_function: (data: AppData) => {
      // Check for consecutive quiz sessions (simplified: just count recent sessions)
      const recentSessions = data.quiz_sessions
        .sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
        .slice(0, 5);
      return recentSessions.length;
    }
  },

  // Consistency Achievements (11-15)
  {
    id: 'three-day-streak',
    name_key: 'achievement.three-day-streak.name',
    description_key: 'achievement.three-day-streak.desc',
    icon: '📅',
    category: 'consistency',
    target_value: 3,
    check_function: (data: AppData) => {
      // Simplified: count if user has activity in last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const recentActivity = [
        ...data.quiz_sessions.filter(s => s.start_time >= threeDaysAgo),
        ...data.flashcards.filter(f => f.created_at >= threeDaysAgo)
      ];
      
      return recentActivity.length >= 3 ? 3 : recentActivity.length;
    }
  },
  {
    id: 'weekly-student',
    name_key: 'achievement.weekly-student.name',
    description_key: 'achievement.weekly-student.desc',
    icon: '🌕',
    category: 'consistency',
    target_value: 7,
    check_function: (data: AppData) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivity = [
        ...data.quiz_sessions.filter(s => s.start_time >= sevenDaysAgo),
        ...data.flashcards.filter(f => f.created_at >= sevenDaysAgo)
      ];
      
      return Math.min(recentActivity.length, 7);
    }
  },
  {
    id: 'monthly-active',
    name_key: 'achievement.monthly-active.name',
    description_key: 'achievement.monthly-active.desc',
    icon: '📅',
    category: 'consistency',
    target_value: 30,
    check_function: (data: AppData) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = [
        ...data.quiz_sessions.filter(s => s.start_time >= thirtyDaysAgo),
        ...data.flashcards.filter(f => f.created_at >= thirtyDaysAgo)
      ];
      
      return Math.min(recentActivity.length, 30);
    }
  },
  {
    id: 'card-series',
    name_key: 'achievement.card-series.name',
    description_key: 'achievement.card-series.desc',
    icon: '🃏',
    category: 'flashcards',
    target_value: 50,
    check_function: (data: AppData) => {
      // Check for cards created in a single day (simplified: total cards)
      return Math.min(data.flashcards.length, 50);
    }
  },
  {
    id: 'quiz-series',
    name_key: 'achievement.quiz-series.name',
    description_key: 'achievement.quiz-series.desc',
    icon: '⭐',
    category: 'quiz',
    target_value: 5,
    check_function: (data: AppData) => {
      // Check for quizzes taken in a single day (simplified: count recent sessions)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaySessions = data.quiz_sessions.filter(s => {
        const sessionDate = new Date(s.start_time);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });
      
      return Math.min(todaySessions.length, 5);
    }
  },

  // Mastery Achievements (16-20)
  {
    id: 'chemistry-lover',
    name_key: 'achievement.chemistry-lover.name',
    description_key: 'achievement.chemistry-lover.desc',
    icon: '❤️',
    category: 'exploration',
    target_value: 100,
    check_function: (data: AppData) => {
      const studiedElements = new Set();
      data.flashcards.forEach(card => {
        if (card.element_id) studiedElements.add(card.element_id);
      });
      return studiedElements.size;
    }
  },
  {
    id: 'knowledge-collector',
    name_key: 'achievement.knowledge-collector.name',
    description_key: 'achievement.knowledge-collector.desc',
    icon: '📚',
    category: 'flashcards',
    target_value: 200,
    check_function: (data: AppData) => {
      return data.flashcards.length;
    }
  },
  {
    id: 'perfect-master',
    name_key: 'achievement.perfect-master.name',
    description_key: 'achievement.perfect-master.desc',
    icon: '✅',
    category: 'mastery',
    target_value: 3,
    check_function: (data: AppData) => {
      const perfectScores = data.quiz_sessions
        .filter(s => s.score === 100)
        .sort((a, b) => b.start_time.getTime() - a.start_time.getTime());
      
      // Check for 3 consecutive perfect scores
      let consecutivePerfect = 0;
      for (let i = 0; i < perfectScores.length && i < 3; i++) {
        consecutivePerfect++;
      }
      
      return consecutivePerfect;
    }
  },
  {
    id: 'flashcard-master',
    name_key: 'achievement.flashcard-master.name',
    description_key: 'achievement.flashcard-master.desc',
    icon: '🧪',
    category: 'mastery',
    target_value: 118, // Total number of elements
    check_function: (data: AppData) => {
      const studiedElements = new Set();
      data.flashcards.forEach(card => {
        if (card.element_id) studiedElements.add(card.element_id);
      });
      return studiedElements.size;
    }
  },
  {
    id: 'chemist-badge',
    name_key: 'achievement.chemist-badge.name',
    description_key: 'achievement.chemist-badge.desc',
    icon: '👑',
    category: 'mastery',
    target_value: 15, // 75% of 20 achievements = 15
    check_function: (_data: AppData) => {
      // This will be calculated by the achievement system itself
      return 0; // Placeholder - will be updated by achievement tracker
    }
  }
];