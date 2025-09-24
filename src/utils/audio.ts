// Audio utilities for playing sound effects

import { loadSettings } from './storage';

// Audio file paths (URL encoded for special characters)
const AUDIO_FILES = {
  buttonClick: '/button_click_sound.mp3',
  nextQuestion: '/next_question_sound.mp3',
  quizSuccess: '/quiz_success_sound.mp3',
  modernDactilo: '/modern_dactilo.mp3',
  enterDactilo: '/enter_dactilo.mp3'
};

// Audio effect types
export type AudioEffectType = 'button_clicks' | 'next_question' | 'quiz_success' | 'element_hover' | 'element_click';

// Audio cache to avoid loading the same audio multiple times
const audioCache = new Map<string, HTMLAudioElement>();

// Audio throttling to prevent overlapping sounds from being too rapid
let lastPlayTime: Record<AudioEffectType, number> = {
  button_clicks: 0,
  next_question: 0,
  quiz_success: 0,
  element_hover: 0,
  element_click: 0
};

// Get audio element from cache or create new one
const getAudioElement = (filePath: string): HTMLAudioElement => {
  if (!audioCache.has(filePath)) {
    const audio = new Audio(filePath);
    audio.preload = 'auto';
    audioCache.set(filePath, audio);
  }
  return audioCache.get(filePath)!;
};

// Play audio effect if enabled in settings
export const playAudioEffect = (effectType: AudioEffectType): void => {
  const settings = loadSettings();
  
  // Check if this specific sound effect is enabled
  if (!settings.sound_effects[effectType]) {
    return;
  }

  // For element hover sounds, prevent too rapid firing (max 10 per second)
  const now = Date.now();
  if (effectType === 'element_hover') {
    if (now - lastPlayTime.element_hover < 100) {
      return;
    }
    lastPlayTime.element_hover = now;
  }
  
  let audioFile: string;
  switch (effectType) {
    case 'button_clicks':
      audioFile = AUDIO_FILES.buttonClick;
      break;
    case 'next_question':
      audioFile = AUDIO_FILES.nextQuestion;
      break;
    case 'quiz_success':
      audioFile = AUDIO_FILES.quizSuccess;
      break;
    case 'element_hover':
      audioFile = AUDIO_FILES.modernDactilo;
      break;
    case 'element_click':
      audioFile = AUDIO_FILES.enterDactilo;
      break;
    default:
      return;
  }
  
  try {
    const audio = getAudioElement(audioFile);
    // Reset audio to beginning and play immediately
    audio.currentTime = 0;
    audio.volume = 0.3; // Reduce volume for better UX during rapid hover
    audio.play().catch(error => {
      console.warn('Failed to play audio effect:', error);
    });
  } catch (error) {
    console.warn('Error playing audio effect:', error);
  }
};

// Convenience functions for specific audio effects
export const playButtonClickSound = () => playAudioEffect('button_clicks');
export const playNextQuestionSound = () => playAudioEffect('next_question');
export const playQuizSuccessSound = () => playAudioEffect('quiz_success');
export const playElementHoverSound = () => playAudioEffect('element_hover');
export const playElementClickSound = () => playAudioEffect('element_click');

// Preload all audio files
export const preloadAudioFiles = (): void => {
  Object.values(AUDIO_FILES).forEach(filePath => {
    getAudioElement(filePath);
  });
};