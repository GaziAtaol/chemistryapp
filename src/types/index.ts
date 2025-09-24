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
  // Enhanced trend information
  trend_explanations?: {
    electronegativity_trend_tr?: string;
    electronegativity_trend_en?: string;
    atomic_radius_trend_tr?: string;
    atomic_radius_trend_en?: string;
    ionization_energy_trend_tr?: string;
    ionization_energy_trend_en?: string;
    general_info_tr?: string;
    general_info_en?: string;
  };
  // Academic-level detailed information
  academic_info?: {
    // Usage areas / Applications
    usage_areas_tr?: string;
    usage_areas_en?: string;
    // Toxicity information
    toxicity_tr?: string;
    toxicity_en?: string;
    // Physical appearance properties
    appearance_tr?: string;
    appearance_en?: string;
    // Radiation properties
    radiation_tr?: string;
    radiation_en?: string;
    // Common isotopes
    isotopes_tr?: string;
    isotopes_en?: string;
    // Natural occurrence
    natural_occurrence_tr?: string;
    natural_occurrence_en?: string;
    // Additional academic information
    academic_notes_tr?: string;
    academic_notes_en?: string;
  };
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
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'academic';
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
  | 'periodic-trend'
  | 'naming'
  | 'property-comparison'
  | 'classification'
  | 'calculation';

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
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'academic';
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
  sound_effects: {
    button_clicks: boolean;
    next_question: boolean;
    quiz_success: boolean;
    element_hover: boolean;
    element_click: boolean;
  };
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
  achievements: UserAchievement[];
  settings: UserSettings;
  progress?: ProgressState;
}

// Achievement system types
export interface Achievement {
  id: string;
  name_key: string; // Translation key for name
  description_key: string; // Translation key for description
  icon: string; // Emoji icon
  category: 'flashcards' | 'quiz' | 'consistency' | 'exploration' | 'mastery';
  target_value: number;
  check_function: (data: AppData) => number; // Function to calculate current progress
}

export interface UserAchievement {
  achievement_id: string;
  unlocked: boolean;
  progress: number;
  unlock_date?: Date;
  current_value: number;
}

// Progress tracking types
export interface DailyProgress {
  flashcardsTarget: number;
  flashcardsDone: number;
  dateKey: string; // YYYY-MM-DD format
}

export interface QuizProgress {
  lastScore: number;
  lastTakenAt: string; // ISO string
}

export interface AchievementQueue {
  unlocked: Array<{
    id: string;
    timestamp: string;
  }>;
  queue: Array<{
    id: string;
    timestamp: string;
  }>;
}

export interface ProgressState {
  daily: DailyProgress;
  quiz: QuizProgress;
  achievements: AchievementQueue;
}