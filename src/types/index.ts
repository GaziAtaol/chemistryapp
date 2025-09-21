// Core data types for chemistry app

export interface Element {
  z: number; // Atomic number
  symbol: string;
  name_en: string;
  name_tr: string;
  mass: number;
  block: 's' | 'p' | 'd' | 'f';
  group?: number;
  period: number;
  category: ElementCategory;
  electron_config: string;
  electron_config_short: string;
  oxidation_states: number[];
  melting_point?: number; // Kelvin
  boiling_point?: number; // Kelvin
  density?: number; // g/cm³
  electronegativity?: number; // Pauling scale
  atomic_radius?: number; // pm
  ionization_energy: number[]; // eV, first few ionization energies
  discovery_year?: number;
  discovered_by?: string;
  phase_at_stp: 'solid' | 'liquid' | 'gas';
}

export type ElementCategory = 
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  element_ids?: number[];
  question_tr: string;
  question_en: string;
  options?: string[];
  correct_answer: string | string[];
  explanation_tr: string;
  explanation_en: string;
  tags: string[];
}

export type QuestionType = 
  | 'multiple-choice'
  | 'matching'
  | 'fill-blank'
  | 'true-false'
  | 'electron-config'
  | 'periodic-trend';

export interface FlashCard {
  id: string;
  front_tr: string;
  front_en: string;
  back_tr: string;
  back_en: string;
  element_id?: number;
  tags: string[];
  leitner_box: 1 | 2 | 3 | 4 | 5;
  next_review: Date;
  created_at: Date;
  last_reviewed?: Date;
  correct_count: number;
  incorrect_count: number;
}

export interface QuizSession {
  id: string;
  start_time: Date;
  end_time?: Date;
  questions: QuizQuestion[];
  answers: { question_id: string; answer: string | string[]; correct: boolean; time_taken: number; }[];
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  mode: 'timed' | 'practice' | 'challenge';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  element_id?: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface UserSettings {
  language: 'tr' | 'en';
  theme: 'light' | 'dark';
  font_size: 'small' | 'medium' | 'large';
  daily_flashcard_target: number;
  notifications_enabled: boolean;
}

export interface AppData {
  elements: Element[];
  quiz_sessions: QuizSession[];
  flashcards: FlashCard[];
  notes: Note[];
  favorites: {
    elements: number[];
    questions: string[];
    flashcards: string[];
    notes: string[];
  };
  settings: UserSettings;
}