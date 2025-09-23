// Audio utilities for playing sound effects

import { loadSettings } from './storage';

// Audio file paths
const AUDIO_FILES = {
  buttonClick: '/button_pressed_on_we-1758670484243.mp3',
  nextQuestion: '/a_next_question_butt-#1-1758670514824.mp3',
  quizSuccess: '/perfect_you_did_your-#3-1758670502731.mp3'
};

// Audio effect types
export type AudioEffectType = 'button_clicks' | 'next_question' | 'quiz_success';

// Audio cache to avoid loading the same audio multiple times
const audioCache = new Map<string, HTMLAudioElement>();

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
    default:
      return;
  }
  
  try {
    const audio = getAudioElement(audioFile);
    // Reset audio to beginning and play
    audio.currentTime = 0;
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

// Preload all audio files
export const preloadAudioFiles = (): void => {
  Object.values(AUDIO_FILES).forEach(filePath => {
    getAudioElement(filePath);
  });
};