// Local storage utilities for app data persistence

import type { AppData, UserSettings, FlashCard, QuizSession, Note } from '../types';
import { allElements } from '../data/elements';

const STORAGE_KEY = 'chemistry-app-data';
const SETTINGS_KEY = 'chemistry-app-settings';

// Default settings
const defaultSettings: UserSettings = {
  language: 'tr',
  theme: 'light',
  font_size: 'medium',
  daily_flashcard_target: 20,
  notifications_enabled: true,
  sound_effects: {
    button_clicks: true,
    next_question: true,
    quiz_success: true,
    element_hover: true,
    element_click: true
  }
};

// Default app data
const defaultAppData: AppData = {
  elements: allElements,
  quiz_sessions: [],
  flashcards: [],
  notes: [],
  favorites: {
    elements: [],
    questions: [],
    flashcards: [],
    notes: []
  },
  achievements: [],
  settings: defaultSettings
};

// Storage utilities
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return reviveData(parsed);
    }
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
  }
  return defaultValue;
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
  }
};

// Convert date strings back to Date objects
const reviveData = (data: any): any => {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    // Check if string looks like a date
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data)) {
      return new Date(data);
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => reviveData(item));
  }
  
  if (typeof data === 'object') {
    const revived: any = {};
    for (const key in data) {
      revived[key] = reviveData(data[key]);
    }
    return revived;
  }
  
  return data;
};

// App data management
export const loadAppData = (): AppData => {
  const data = loadFromStorage(STORAGE_KEY, defaultAppData);
  // Ensure elements are up to date
  return {
    ...data,
    elements: allElements
  };
};

export const saveAppData = (data: Partial<AppData>): void => {
  const currentData = loadAppData();
  const updatedData = { ...currentData, ...data };
  saveToStorage(STORAGE_KEY, updatedData);
};

// Settings management
export const loadSettings = (): UserSettings => {
  return loadFromStorage(SETTINGS_KEY, defaultSettings);
};

export const saveSettings = (settings: Partial<UserSettings>): void => {
  const currentSettings = loadSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  saveToStorage(SETTINGS_KEY, updatedSettings);
};

// Specific data operations
export const addFlashCard = (card: FlashCard): void => {
  const data = loadAppData();
  data.flashcards.push(card);
  saveAppData(data);
};

export const updateFlashCard = (cardId: string, updates: Partial<FlashCard>): void => {
  const data = loadAppData();
  const index = data.flashcards.findIndex(card => card.id === cardId);
  if (index !== -1) {
    data.flashcards[index] = { ...data.flashcards[index], ...updates };
    saveAppData(data);
  }
};

export const deleteFlashCard = (cardId: string): void => {
  const data = loadAppData();
  data.flashcards = data.flashcards.filter(card => card.id !== cardId);
  saveAppData(data);
};

export const addQuizSession = (session: QuizSession): void => {
  const data = loadAppData();
  data.quiz_sessions.push(session);
  saveAppData(data);
};

export const addNote = (note: Note): void => {
  const data = loadAppData();
  data.notes.push(note);
  saveAppData(data);
};

export const updateNote = (noteId: string, updates: Partial<Note>): void => {
  const data = loadAppData();
  const index = data.notes.findIndex(note => note.id === noteId);
  if (index !== -1) {
    data.notes[index] = { ...data.notes[index], ...updates };
    saveAppData(data);
  }
};

export const deleteNote = (noteId: string): void => {
  const data = loadAppData();
  data.notes = data.notes.filter(note => note.id !== noteId);
  saveAppData(data);
};

// Favorites management
export const toggleElementFavorite = (elementId: number): void => {
  const data = loadAppData();
  const favorites = data.favorites.elements;
  const index = favorites.indexOf(elementId);
  
  if (index === -1) {
    favorites.push(elementId);
  } else {
    favorites.splice(index, 1);
  }
  
  saveAppData(data);
};

export const toggleFlashCardFavorite = (cardId: string): void => {
  const data = loadAppData();
  const favorites = data.favorites.flashcards;
  const index = favorites.indexOf(cardId);
  
  if (index === -1) {
    favorites.push(cardId);
  } else {
    favorites.splice(index, 1);
  }
  
  saveAppData(data);
};

export const toggleNoteFavorite = (noteId: string): void => {
  const data = loadAppData();
  const favorites = data.favorites.notes;
  const index = favorites.indexOf(noteId);
  
  if (index === -1) {
    favorites.push(noteId);
  } else {
    favorites.splice(index, 1);
  }
  
  saveAppData(data);
};

// Data import/export
export const exportData = (): string => {
  const data = loadAppData();
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // Basic validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }
    
    // Validate required fields
    const requiredFields = ['elements', 'quiz_sessions', 'flashcards', 'notes', 'favorites', 'settings'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Backup current data
    const currentData = loadAppData();
    saveToStorage(STORAGE_KEY + '_backup', currentData);
    
    // Import new data
    const importedData: AppData = {
      ...data,
      elements: allElements // Always use latest element data
    };
    
    saveAppData(importedData);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const resetData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
};

export const loadSampleData = (): void => {
  const sampleCards: FlashCard[] = [
    {
      id: 'sample-1',
      front_tr: 'H',
      front_en: 'H',
      back_tr: 'Hidrojen',
      back_en: 'Hydrogen',
      element_id: 1,
      tags: ['sembol', 'element'],
      leitner_box: 1,
      next_review: new Date(),
      created_at: new Date(),
      correct_count: 0,
      incorrect_count: 0
    },
    {
      id: 'sample-2',
      front_tr: 'Atom numarası 8',
      front_en: 'Atomic number 8',
      back_tr: 'Oksijen (O)',
      back_en: 'Oxygen (O)',
      element_id: 8,
      tags: ['atom-numarası'],
      leitner_box: 1,
      next_review: new Date(),
      created_at: new Date(),
      correct_count: 0,
      incorrect_count: 0
    }
  ];
  
  const sampleNotes: Note[] = [
    {
      id: 'note-1',
      title: 'Periyodik Tablo Notları',
      content: 'Periyodik tabloda elementler atom numaralarına göre sıralanır. Aynı grupta (sütunda) olan elementlerin benzer özellikleri vardır.',
      tags: ['periyodik-tablo', 'genel'],
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  // Sample quiz sessions for testing history
  const now = new Date();
  const sampleQuizSessions: QuizSession[] = [
    {
      id: 'sample-quiz-1',
      start_time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      end_time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 5 minutes later
      score: 85,
      difficulty: 'medium',
      mode: 'practice',
      topics: ['periyodik-tablo', 'elementler'],
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          difficulty: 'medium',
          element_ids: [1],
          question_tr: 'Hidrojenin atom numarası kaçtır?',
          question_en: 'What is the atomic number of hydrogen?',
          options: ['1', '2', '3', '4'],
          correct_answer: '1',
          explanation_tr: 'Hidrojen periyodik tablonun ilk elementidir ve atom numarası 1\'dir.',
          explanation_en: 'Hydrogen is the first element in the periodic table with atomic number 1.',
          tags: ['hidrojen', 'atom-numarası']
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          difficulty: 'medium',
          element_ids: [8],
          question_tr: 'Oksijenin simgesi nedir?',
          question_en: 'What is the symbol of oxygen?',
          options: ['O', 'Ox', 'Og', 'Os'],
          correct_answer: 'O',
          explanation_tr: 'Oksijenin kimyasal simgesi O\'dur.',
          explanation_en: 'The chemical symbol for oxygen is O.',
          tags: ['oksijen', 'simge']
        }
      ],
      answers: [
        { question_id: 'q1', answer: '1', correct: true, time_taken: 10 },
        { question_id: 'q2', answer: 'O', correct: true, time_taken: 8 }
      ]
    },
    {
      id: 'sample-quiz-2',
      start_time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      end_time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 7 * 60 * 1000), // 7 minutes later
      score: 60,
      difficulty: 'hard',
      mode: 'timed',
      topics: ['periyodik-eğilimler'],
      questions: [
        {
          id: 'q3',
          type: 'multiple-choice',
          difficulty: 'hard',
          element_ids: [3, 11],
          question_tr: 'Lityum ile sodyum arasında hangi periyodik eğilim gözlemlenir?',
          question_en: 'What periodic trend is observed between lithium and sodium?',
          options: ['Atom yarıçapı artar', 'Atom yarıçapı azalır', 'İyonlaşma enerjisi artar', 'Elektronegatiflik artar'],
          correct_answer: 'Atom yarıçapı artar',
          explanation_tr: 'Grupta aşağıya indikçe atom yarıçapı artar.',
          explanation_en: 'Atomic radius increases as you move down a group.',
          tags: ['periyodik-eğilimler', 'atom-yarıçapı']
        }
      ],
      answers: [
        { question_id: 'q3', answer: 'Atom yarıçapı azalır', correct: false, time_taken: 25 }
      ]
    },
    {
      id: 'sample-quiz-3',
      start_time: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      end_time: new Date(now.getTime() - 6 * 60 * 60 * 1000 + 12 * 60 * 1000), // 12 minutes later
      score: 95,
      difficulty: 'easy',
      mode: 'practice',
      topics: ['temel-elementler'],
      questions: [
        {
          id: 'q4',
          type: 'multiple-choice',
          difficulty: 'easy',
          element_ids: [6],
          question_tr: 'Karbonun simgesi nedir?',
          question_en: 'What is the symbol of carbon?',
          options: ['C', 'Ca', 'Co', 'Cr'],
          correct_answer: 'C',
          explanation_tr: 'Karbonun kimyasal simgesi C\'dir.',
          explanation_en: 'The chemical symbol for carbon is C.',
          tags: ['karbon', 'simge']
        },
        {
          id: 'q5',
          type: 'multiple-choice',
          difficulty: 'easy',
          element_ids: [7],
          question_tr: 'Azotun atom numarası kaçtır?',
          question_en: 'What is the atomic number of nitrogen?',
          options: ['6', '7', '8', '9'],
          correct_answer: '7',
          explanation_tr: 'Azotun atom numarası 7\'dir.',
          explanation_en: 'The atomic number of nitrogen is 7.',
          tags: ['azot', 'atom-numarası']
        }
      ],
      answers: [
        { question_id: 'q4', answer: 'C', correct: true, time_taken: 5 },
        { question_id: 'q5', answer: '7', correct: true, time_taken: 4 }
      ]
    }
  ];
  
  const data = loadAppData();
  data.flashcards = [...data.flashcards, ...sampleCards];
  data.notes = [...data.notes, ...sampleNotes];
  data.quiz_sessions = [...data.quiz_sessions, ...sampleQuizSessions];
  saveAppData(data);
};

// Leitner system utilities
export const calculateNextReviewDate = (box: number): Date => {
  const days = [1, 2, 4, 7, 14]; // Days for each box
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + (days[box - 1] || 14));
  return nextReview;
};

export const getCardsForReview = (): FlashCard[] => {
  const data = loadAppData();
  const now = new Date();
  
  return data.flashcards.filter(card => 
    card.next_review <= now
  );
};

export const updateCardAfterReview = (cardId: string, correct: boolean): void => {
  const data = loadAppData();
  const card = data.flashcards.find(c => c.id === cardId);
  
  if (card) {
    if (correct) {
      card.correct_count++;
      if (card.leitner_box < 5) {
        card.leitner_box = (card.leitner_box + 1) as 1 | 2 | 3 | 4 | 5;
      }
    } else {
      card.incorrect_count++;
      card.leitner_box = 1;
    }
    
    card.last_reviewed = new Date();
    card.next_review = calculateNextReviewDate(card.leitner_box);
    
    updateFlashCard(cardId, card);
  }
};