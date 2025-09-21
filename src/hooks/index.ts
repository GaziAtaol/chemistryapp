// React hooks for app state management

import { useState, useEffect, useCallback } from 'react';
import type { AppData, UserSettings, FlashCard, QuizSession, Note } from '../types';
import { 
  loadAppData, 
  saveAppData, 
  loadSettings, 
  saveSettings,
  toggleElementFavorite,
  toggleFlashCardFavorite,
  toggleNoteFavorite,
  addFlashCard,
  updateFlashCard,
  deleteFlashCard,
  addNote,
  updateNote,
  deleteNote,
  addQuizSession,
  getCardsForReview,
  updateCardAfterReview
} from '../utils/storage';
import { setLanguage } from '../utils/i18n';

// App data hook
export const useAppData = () => {
  const [data, setData] = useState<AppData>(() => loadAppData());
  
  const refreshData = useCallback(() => {
    setData(loadAppData());
  }, []);
  
  const updateData = useCallback((updates: Partial<AppData>) => {
    saveAppData(updates);
    refreshData();
  }, [refreshData]);
  
  return {
    data,
    refreshData,
    updateData
  };
};

// Settings hook
export const useSettings = () => {
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettings());
  
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    saveSettings(updates);
    setSettingsState(newSettings);
    
    // Apply theme
    if (updates.theme) {
      document.documentElement.setAttribute('data-theme', updates.theme);
    }
    
    // Apply language
    if (updates.language) {
      setLanguage(updates.language);
    }
    
    // Apply font size
    if (updates.font_size) {
      document.documentElement.setAttribute('data-font-size', updates.font_size);
    }
  }, [settings]);
  
  // Initialize theme and language on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-font-size', settings.font_size);
    setLanguage(settings.language);
  }, [settings.theme, settings.font_size, settings.language]);
  
  return {
    settings,
    updateSettings
  };
};

// Favorites hook
export const useFavorites = () => {
  const { data, refreshData } = useAppData();
  
  const toggleElement = useCallback((elementId: number) => {
    toggleElementFavorite(elementId);
    refreshData();
  }, [refreshData]);
  
  const toggleFlashCard = useCallback((cardId: string) => {
    toggleFlashCardFavorite(cardId);
    refreshData();
  }, [refreshData]);
  
  const toggleNote = useCallback((noteId: string) => {
    toggleNoteFavorite(noteId);
    refreshData();
  }, [refreshData]);
  
  const isElementFavorite = useCallback((elementId: number) => {
    return data.favorites.elements.includes(elementId);
  }, [data.favorites.elements]);
  
  const isFlashCardFavorite = useCallback((cardId: string) => {
    return data.favorites.flashcards.includes(cardId);
  }, [data.favorites.flashcards]);
  
  const isNoteFavorite = useCallback((noteId: string) => {
    return data.favorites.notes.includes(noteId);
  }, [data.favorites.notes]);
  
  return {
    favorites: data.favorites,
    toggleElement,
    toggleFlashCard,
    toggleNote,
    isElementFavorite,
    isFlashCardFavorite,
    isNoteFavorite
  };
};

// Elements hook
export const useElements = () => {
  const { data } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  
  const filteredElements = useCallback(() => {
    let filtered = data.elements;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(element =>
        element.name_tr.toLowerCase().includes(query) ||
        element.name_en.toLowerCase().includes(query) ||
        element.symbol.toLowerCase().includes(query) ||
        element.z.toString().includes(query)
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(element => element.category === selectedCategory);
    }
    
    // Block filter
    if (selectedBlock !== 'all') {
      filtered = filtered.filter(element => element.block === selectedBlock);
    }
    
    return filtered;
  }, [data.elements, searchQuery, selectedCategory, selectedBlock]);
  
  const getElementById = useCallback((id: number) => {
    return data.elements.find(element => element.z === id);
  }, [data.elements]);
  
  return {
    elements: data.elements,
    filteredElements: filteredElements(),
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBlock,
    setSelectedBlock,
    getElementById
  };
};

// Flashcards hook
export const useFlashCards = () => {
  const { data, refreshData } = useAppData();
  
  const createCard = useCallback((card: Omit<FlashCard, 'id' | 'created_at'>) => {
    const newCard: FlashCard = {
      ...card,
      id: Date.now().toString(),
      created_at: new Date()
    };
    addFlashCard(newCard);
    refreshData();
  }, [refreshData]);
  
  const updateCard = useCallback((cardId: string, updates: Partial<FlashCard>) => {
    updateFlashCard(cardId, updates);
    refreshData();
  }, [refreshData]);
  
  const deleteCard = useCallback((cardId: string) => {
    deleteFlashCard(cardId);
    refreshData();
  }, [refreshData]);
  
  const getCardsDue = useCallback(() => {
    return getCardsForReview();
  }, []);
  
  const reviewCard = useCallback((cardId: string, correct: boolean) => {
    updateCardAfterReview(cardId, correct);
    refreshData();
  }, [refreshData]);
  
  const getCardsByBox = useCallback((box: 1 | 2 | 3 | 4 | 5) => {
    return data.flashcards.filter(card => card.leitner_box === box);
  }, [data.flashcards]);
  
  return {
    flashcards: data.flashcards,
    createCard,
    updateCard,
    deleteCard,
    getCardsDue,
    reviewCard,
    getCardsByBox
  };
};

// Notes hook
export const useNotes = () => {
  const { data, refreshData } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  
  const createNote = useCallback((note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      created_at: new Date(),
      updated_at: new Date()
    };
    addNote(newNote);
    refreshData();
  }, [refreshData]);
  
  const updateNoteById = useCallback((noteId: string, updates: Partial<Note>) => {
    const updatedNote = {
      ...updates,
      updated_at: new Date()
    };
    updateNote(noteId, updatedNote);
    refreshData();
  }, [refreshData]);
  
  const deleteNoteById = useCallback((noteId: string) => {
    deleteNote(noteId);
    refreshData();
  }, [refreshData]);
  
  const filteredNotes = useCallback(() => {
    if (!searchQuery) return data.notes;
    
    const query = searchQuery.toLowerCase();
    return data.notes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [data.notes, searchQuery]);
  
  const getNotesByElement = useCallback((elementId: number) => {
    return data.notes.filter(note => note.element_id === elementId);
  }, [data.notes]);
  
  return {
    notes: data.notes,
    filteredNotes: filteredNotes(),
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote: updateNoteById,
    deleteNote: deleteNoteById,
    getNotesByElement
  };
};

// Quiz hook
export const useQuiz = () => {
  const { data, refreshData } = useAppData();
  
  const saveQuizSession = useCallback((session: Omit<QuizSession, 'id'>) => {
    const newSession: QuizSession = {
      ...session,
      id: Date.now().toString()
    };
    addQuizSession(newSession);
    refreshData();
  }, [refreshData]);
  
  const getRecentSessions = useCallback((limit: number = 10) => {
    return data.quiz_sessions
      .sort((a, b) => b.start_time.getTime() - a.start_time.getTime())
      .slice(0, limit);
  }, [data.quiz_sessions]);
  
  const getSessionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return data.quiz_sessions.filter(session =>
      session.start_time >= startDate && session.start_time <= endDate
    );
  }, [data.quiz_sessions]);
  
  const calculateStats = useCallback(() => {
    const sessions = data.quiz_sessions;
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        totalTime: 0,
        averageTime: 0,
        bestScore: 0,
        improvementTrend: 0
      };
    }
    
    const totalSessions = sessions.length;
    const averageScore = sessions.reduce((sum, session) => sum + session.score, 0) / totalSessions;
    const totalTime = sessions.reduce((sum, session) => {
      if (session.end_time) {
        return sum + (session.end_time.getTime() - session.start_time.getTime());
      }
      return sum;
    }, 0);
    const averageTime = totalTime / totalSessions;
    const bestScore = Math.max(...sessions.map(session => session.score));
    
    // Calculate improvement trend (last 5 vs previous 5)
    const recent = sessions.slice(-5);
    const previous = sessions.slice(-10, -5);
    const recentAvg = recent.length > 0 ? recent.reduce((sum, s) => sum + s.score, 0) / recent.length : 0;
    const previousAvg = previous.length > 0 ? previous.reduce((sum, s) => sum + s.score, 0) / previous.length : 0;
    const improvementTrend = recentAvg - previousAvg;
    
    return {
      totalSessions,
      averageScore,
      totalTime,
      averageTime,
      bestScore,
      improvementTrend
    };
  }, [data.quiz_sessions]);
  
  return {
    quizSessions: data.quiz_sessions,
    saveQuizSession,
    getRecentSessions,
    getSessionsByDateRange,
    calculateStats
  };
};

// Search hook
export const useSearch = () => {
  const { data } = useAppData();
  const [query, setQuery] = useState('');
  
  const searchAll = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      return {
        elements: [],
        flashcards: [],
        notes: [],
        total: 0
      };
    }
    
    const q = searchQuery.toLowerCase();
    
    const elements = data.elements.filter(element =>
      element.name_tr.toLowerCase().includes(q) ||
      element.name_en.toLowerCase().includes(q) ||
      element.symbol.toLowerCase().includes(q)
    );
    
    const flashcards = data.flashcards.filter(card =>
      card.front_tr.toLowerCase().includes(q) ||
      card.front_en.toLowerCase().includes(q) ||
      card.back_tr.toLowerCase().includes(q) ||
      card.back_en.toLowerCase().includes(q) ||
      card.tags.some(tag => tag.toLowerCase().includes(q))
    );
    
    const notes = data.notes.filter(note =>
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tags.some(tag => tag.toLowerCase().includes(q))
    );
    
    return {
      elements,
      flashcards,
      notes,
      total: elements.length + flashcards.length + notes.length
    };
  }, [data]);
  
  const results = searchAll(query);
  
  return {
    query,
    setQuery,
    results,
    searchAll
  };
};