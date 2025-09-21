import type { QuizQuestion, QuestionType, Element } from '../types';
import { allElements } from '../data/elements';

// Question type frequencies (can be adjusted based on quiz config)
const DEFAULT_QUESTION_TYPE_WEIGHTS: Record<QuestionType, number> = {
  'multiple-choice': 0.3,
  'true-false': 0.2,
  'fill-blank': 0.15,
  'matching': 0.1,
  'electron-config': 0.1,
  'periodic-trend': 0.05,
  'naming': 0.05,
  'property-comparison': 0.03,
  'classification': 0.02,
  'calculation': 0.02
};

interface QuestionGeneratorConfig {
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'academic';
  questionCount: number;
  questionTypes: QuestionType[];
}

function getRandomElement(): Element {
  return allElements[Math.floor(Math.random() * allElements.length)];
}

function getRandomElements(count: number): Element[] {
  const shuffled = [...allElements].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateMultipleChoiceQuestion(difficulty: string): QuizQuestion {
  const element = getRandomElement();
  const wrongElements = getRandomElements(3).filter(e => e.z !== element.z);
  
  const questionTypes = [
    'symbol', 'name', 'atomic_number', 'category', 'group', 'period'
  ];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  
  let question_tr = '';
  let question_en = '';
  let correct_answer = '';
  let options: string[] = [];
  
  switch (questionType) {
    case 'symbol':
      question_tr = `${element.name_tr} elementinin simgesi nedir?`;
      question_en = `What is the symbol of ${element.name_en}?`;
      correct_answer = element.symbol;
      options = [element.symbol, ...wrongElements.map(e => e.symbol)];
      break;
    case 'name':
      question_tr = `${element.symbol} simgeli elementin adı nedir?`;
      question_en = `What is the name of the element with symbol ${element.symbol}?`;
      correct_answer = element.name_tr;
      options = [element.name_tr, ...wrongElements.map(e => e.name_tr)];
      break;
    case 'atomic_number':
      question_tr = `${element.name_tr} elementinin atom numarası nedir?`;
      question_en = `What is the atomic number of ${element.name_en}?`;
      correct_answer = element.z.toString();
      options = [element.z.toString(), ...wrongElements.map(e => e.z.toString())];
      break;
    case 'category':
      question_tr = `${element.name_tr} hangi kategoriye aittir?`;
      question_en = `Which category does ${element.name_en} belong to?`;
      correct_answer = getCategoryName(element.category);
      options = [getCategoryName(element.category), ...wrongElements.map(e => getCategoryName(e.category))];
      break;
    case 'group':
      if (element.group) {
        question_tr = `${element.name_tr} hangi grupta yer alır?`;
        question_en = `Which group is ${element.name_en} in?`;
        correct_answer = element.group.toString();
        options = [element.group.toString(), ...wrongElements.filter(e => e.group).map(e => e.group!.toString())];
      }
      break;
    case 'period':
      question_tr = `${element.name_tr} hangi periyotta yer alır?`;
      question_en = `Which period is ${element.name_en} in?`;
      correct_answer = element.period.toString();
      options = [element.period.toString(), ...wrongElements.map(e => e.period.toString())];
      break;
  }
  
  // Shuffle options
  options = options.slice(0, 4).sort(() => 0.5 - Math.random());
  
  return {
    id: `mc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'multiple-choice',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element.z],
    question_tr,
    question_en,
    options,
    correct_answer,
    explanation_tr: `${element.name_tr} (${element.symbol}) hakkında temel bilgi.`,
    explanation_en: `Basic information about ${element.name_en} (${element.symbol}).`,
    tags: ['element', 'basic']
  };
}

function generateTrueFalseQuestion(difficulty: string): QuizQuestion {
  const element = getRandomElement();
  const isTrue = Math.random() > 0.5;
  
  const statements = [
    {
      true_tr: `${element.name_tr} elementinin simgesi ${element.symbol}'dir.`,
      true_en: `The symbol of ${element.name_en} is ${element.symbol}.`,
      false_tr: `${element.name_tr} elementinin simgesi ${getRandomElement().symbol}'dir.`,
      false_en: `The symbol of ${element.name_en} is ${getRandomElement().symbol}.`
    },
    {
      true_tr: `${element.name_tr} ${element.period}. periyotta yer alır.`,
      true_en: `${element.name_en} is in period ${element.period}.`,
      false_tr: `${element.name_tr} ${element.period + 1}. periyotta yer alır.`,
      false_en: `${element.name_en} is in period ${element.period + 1}.`
    }
  ];
  
  const statement = statements[Math.floor(Math.random() * statements.length)];
  
  return {
    id: `tf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'true-false',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element.z],
    question_tr: isTrue ? statement.true_tr : statement.false_tr,
    question_en: isTrue ? statement.true_en : statement.false_en,
    options: ['Doğru', 'Yanlış'],
    correct_answer: isTrue ? 'Doğru' : 'Yanlış',
    explanation_tr: `${element.name_tr} hakkında doğru bilgi.`,
    explanation_en: `Correct information about ${element.name_en}.`,
    tags: ['element', 'true-false']
  };
}

function generateFillBlankQuestion(difficulty: string): QuizQuestion {
  const element = getRandomElement();
  
  const templates = [
    {
      tr: `${element.name_tr} elementinin simgesi _____ 'dir.`,
      en: `The symbol of ${element.name_en} is _____.`,
      answer: element.symbol
    },
    {
      tr: `_____ simgeli elementin adı ${element.name_tr}'dir.`,
      en: `The element with symbol _____ is ${element.name_en}.`,
      answer: element.symbol
    },
    {
      tr: `${element.name_tr} elementinin atom numarası _____ 'dir.`,
      en: `The atomic number of ${element.name_en} is _____.`,
      answer: element.z.toString()
    }
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'fill-blank',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element.z],
    question_tr: template.tr,
    question_en: template.en,
    correct_answer: template.answer,
    explanation_tr: `${element.name_tr} (${element.symbol}) hakkında temel bilgi.`,
    explanation_en: `Basic information about ${element.name_en} (${element.symbol}).`,
    tags: ['element', 'fill-blank']
  };
}

function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    'alkali-metal': 'Alkali Metal',
    'alkaline-earth-metal': 'Alkaline Earth Metal',
    'transition-metal': 'Transition Metal',
    'post-transition-metal': 'Post-transition Metal',
    'metalloid': 'Metalloid',
    'nonmetal': 'Nonmetal',
    'halogen': 'Halogen',
    'noble-gas': 'Noble Gas',
    'lanthanide': 'Lanthanide',
    'actinide': 'Actinide'
  };
  return categoryNames[category] || category;
}

function generateQuestionByType(type: QuestionType, difficulty: string): QuizQuestion {
  switch (type) {
    case 'multiple-choice':
      return generateMultipleChoiceQuestion(difficulty);
    case 'true-false':
      return generateTrueFalseQuestion(difficulty);
    case 'fill-blank':
      return generateFillBlankQuestion(difficulty);
    default:
      // For now, fallback to multiple choice for unimplemented types
      return generateMultipleChoiceQuestion(difficulty);
  }
}

export function generateQuestions(config: QuestionGeneratorConfig): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const { difficulty, questionCount, questionTypes } = config;
  
  // Calculate distribution based on selected types
  const selectedWeights: Partial<Record<QuestionType, number>> = {};
  let totalWeight = 0;
  
  for (const type of questionTypes) {
    selectedWeights[type] = DEFAULT_QUESTION_TYPE_WEIGHTS[type] || 0.1;
    totalWeight += selectedWeights[type];
  }
  
  // Normalize weights
  for (const type of questionTypes) {
    selectedWeights[type] = (selectedWeights[type] || 0) / totalWeight;
  }
  
  // Generate questions based on distribution
  for (let i = 0; i < questionCount; i++) {
    const random = Math.random();
    let cumulative = 0;
    let selectedType = questionTypes[0]; // fallback
    
    for (const type of questionTypes) {
      cumulative += selectedWeights[type] || 0;
      if (random <= cumulative) {
        selectedType = type;
        break;
      }
    }
    
    const question = generateQuestionByType(selectedType, difficulty);
    questions.push(question);
  }
  
  return questions;
}