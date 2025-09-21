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

function generateMatchingQuestion(difficulty: string): QuizQuestion {
  const elements = getRandomElements(4);
  const pairs = elements.map(element => ({
    left: element.name_tr,
    right: element.symbol
  }));
  
  // Shuffle the right side
  const rightOptions = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
  
  return {
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'matching',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: elements.map(e => e.z),
    question_tr: 'Aşağıdaki element isimlerini simgeleriyle eşleştiriniz:',
    question_en: 'Match the following element names with their symbols:',
    options: rightOptions,
    correct_answer: pairs.map(p => `${p.left}:${p.right}`),
    explanation_tr: 'Element isimleri ve simgeleri doğru şekilde eşleştirilmiştir.',
    explanation_en: 'Element names and symbols are correctly matched.',
    tags: ['element', 'matching', 'symbol']
  };
}

function generateElectronConfigQuestion(difficulty: string): QuizQuestion {
  const element = getRandomElement();
  const wrongConfigs = getRandomElements(3)
    .filter(e => e.z !== element.z)
    .map(e => e.electron_config_short);
  
  const options = [element.electron_config_short, ...wrongConfigs].sort(() => Math.random() - 0.5);
  
  return {
    id: `ec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'electron-config',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element.z],
    question_tr: `${element.name_tr} (${element.symbol}) elementinin elektron konfigürasyonu nedir?`,
    question_en: `What is the electron configuration of ${element.name_en} (${element.symbol})?`,
    options,
    correct_answer: element.electron_config_short,
    explanation_tr: `${element.name_tr} elementinin elektron konfigürasyonu ${element.electron_config_short}'dir.`,
    explanation_en: `The electron configuration of ${element.name_en} is ${element.electron_config_short}.`,
    tags: ['element', 'electron-config']
  };
}

function generatePeriodicTrendQuestion(difficulty: string): QuizQuestion {
  const elements = getRandomElements(2).sort((a, b) => a.z - b.z);
  const [element1, element2] = elements;
  
  const trends = [
    {
      property: 'atomic radius',
      property_tr: 'atom yarıçapı',
      comparison: element1.atomic_radius && element2.atomic_radius ? 
        (element1.atomic_radius > element2.atomic_radius ? 'larger' : 'smaller') : 'unknown'
    },
    {
      property: 'ionization energy',
      property_tr: 'iyonlaşma enerjisi',
      comparison: element1.ionization_energy[0] > element2.ionization_energy[0] ? 'higher' : 'lower'
    }
  ];
  
  const trend = trends[Math.floor(Math.random() * trends.length)];
  
  return {
    id: `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'periodic-trend',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element1.z, element2.z],
    question_tr: `${element1.name_tr} ve ${element2.name_tr} elementleri arasında ${trend.property_tr} bakımından hangisi daha büyüktür?`,
    question_en: `Between ${element1.name_en} and ${element2.name_en}, which has a ${trend.comparison} ${trend.property}?`,
    options: [element1.name_tr, element2.name_tr],
    correct_answer: trend.comparison === 'larger' || trend.comparison === 'higher' ? 
      element1.name_tr : element2.name_tr,
    explanation_tr: `Periyodik tabloda ${trend.property_tr} eğilimi gereği bu sonuç doğrudur.`,
    explanation_en: `This is correct based on the periodic trend for ${trend.property}.`,
    tags: ['element', 'periodic-trend', 'comparison']
  };
}

function generateNamingQuestion(difficulty: string): QuizQuestion {
  const element = getRandomElement();
  const wrongNames = getRandomElements(3)
    .filter(e => e.z !== element.z)
    .map(e => e.name_tr);
  
  const options = [element.name_tr, ...wrongNames].sort(() => Math.random() - 0.5);
  
  return {
    id: `name_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'naming',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element.z],
    question_tr: `${element.symbol} simgeli elementin adı nedir?`,
    question_en: `What is the name of the element with symbol ${element.symbol}?`,
    options,
    correct_answer: element.name_tr,
    explanation_tr: `${element.symbol} simgesi ${element.name_tr} elementine aittir.`,
    explanation_en: `The symbol ${element.symbol} belongs to ${element.name_en}.`,
    tags: ['element', 'naming', 'symbol']
  };
}

function generatePropertyComparisonQuestion(difficulty: string): QuizQuestion {
  const elements = getRandomElements(2);
  const [element1, element2] = elements;
  
  const properties = [
    {
      name: 'mass',
      name_tr: 'atom kütlesi',
      value1: element1.mass,
      value2: element2.mass,
      unit: 'u'
    },
    {
      name: 'atomic number',
      name_tr: 'atom numarası',
      value1: element1.z,
      value2: element2.z,
      unit: ''
    }
  ];
  
  const property = properties[Math.floor(Math.random() * properties.length)];
  const correctElement = property.value1 > property.value2 ? element1 : element2;
  
  return {
    id: `pc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'property-comparison',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element1.z, element2.z],
    question_tr: `${element1.name_tr} ve ${element2.name_tr} elementlerinden hangisinin ${property.name_tr} daha büyüktür?`,
    question_en: `Which element has a larger ${property.name}: ${element1.name_en} or ${element2.name_en}?`,
    options: [element1.name_tr, element2.name_tr],
    correct_answer: correctElement.name_tr,
    explanation_tr: `${correctElement.name_tr} elementinin ${property.name_tr} ${property.value1 > property.value2 ? property.value1 : property.value2} ${property.unit}'dir.`,
    explanation_en: `${correctElement.name_en} has a ${property.name} of ${property.value1 > property.value2 ? property.value1 : property.value2} ${property.unit}.`,
    tags: ['element', 'property-comparison']
  };
}

function generateClassificationQuestion(difficulty: string): QuizQuestion {
  const element = getRandomElement();
  const wrongCategories = ['alkali-metal', 'noble-gas', 'halogen', 'transition-metal']
    .filter(cat => cat !== element.category)
    .slice(0, 3)
    .map(cat => getCategoryName(cat));
  
  const options = [getCategoryName(element.category), ...wrongCategories].sort(() => Math.random() - 0.5);
  
  return {
    id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'classification',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element.z],
    question_tr: `${element.name_tr} (${element.symbol}) hangi element grubuna aittir?`,
    question_en: `Which element group does ${element.name_en} (${element.symbol}) belong to?`,
    options,
    correct_answer: getCategoryName(element.category),
    explanation_tr: `${element.name_tr} ${getCategoryName(element.category)} grubuna aittir.`,
    explanation_en: `${element.name_en} belongs to the ${getCategoryName(element.category)} group.`,
    tags: ['element', 'classification', 'category']
  };
}

function generateCalculationQuestion(difficulty: string): QuizQuestion {
  const element = getRandomElement();
  
  const calculations = [
    {
      question_tr: `${element.name_tr} elementinin bir atomunda kaç proton vardır?`,
      question_en: `How many protons are in one atom of ${element.name_en}?`,
      answer: element.z.toString(),
      explanation_tr: `Atom numarası proton sayısına eşittir: ${element.z}`,
      explanation_en: `Atomic number equals number of protons: ${element.z}`
    },
    {
      question_tr: `${element.name_tr} elementinin yaklaşık atom kütlesi kaçtır?`,
      question_en: `What is the approximate atomic mass of ${element.name_en}?`,
      answer: Math.round(element.mass).toString(),
      explanation_tr: `${element.name_tr} elementinin atom kütlesi yaklaşık ${Math.round(element.mass)} u'dur.`,
      explanation_en: `The atomic mass of ${element.name_en} is approximately ${Math.round(element.mass)} u.`
    }
  ];
  
  const calc = calculations[Math.floor(Math.random() * calculations.length)];
  
  return {
    id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'calculation',
    difficulty: difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'academic',
    element_ids: [element.z],
    question_tr: calc.question_tr,
    question_en: calc.question_en,
    correct_answer: calc.answer,
    explanation_tr: calc.explanation_tr,
    explanation_en: calc.explanation_en,
    tags: ['element', 'calculation']
  };
}

function generateQuestionByType(type: QuestionType, difficulty: string): QuizQuestion {
  switch (type) {
    case 'multiple-choice':
      return generateMultipleChoiceQuestion(difficulty);
    case 'true-false':
      return generateTrueFalseQuestion(difficulty);
    case 'fill-blank':
      return generateFillBlankQuestion(difficulty);
    case 'matching':
      return generateMatchingQuestion(difficulty);
    case 'electron-config':
      return generateElectronConfigQuestion(difficulty);
    case 'periodic-trend':
      return generatePeriodicTrendQuestion(difficulty);
    case 'naming':
      return generateNamingQuestion(difficulty);
    case 'property-comparison':
      return generatePropertyComparisonQuestion(difficulty);
    case 'classification':
      return generateClassificationQuestion(difficulty);
    case 'calculation':
      return generateCalculationQuestion(difficulty);
    default:
      // Fallback to multiple choice for any unexpected types
      return generateMultipleChoiceQuestion(difficulty);
  }
}

export function generateQuestions(config: QuestionGeneratorConfig): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const { difficulty, questionCount, questionTypes } = config;
  
  // Ensure we only generate questions from selected types
  if (questionTypes.length === 0) {
    throw new Error('At least one question type must be selected');
  }
  
  // Calculate distribution based on selected types only
  const selectedWeights: Partial<Record<QuestionType, number>> = {};
  let totalWeight = 0;
  
  for (const type of questionTypes) {
    selectedWeights[type] = DEFAULT_QUESTION_TYPE_WEIGHTS[type] || 0.1;
    totalWeight += selectedWeights[type];
  }
  
  // Normalize weights to sum to 1
  for (const type of questionTypes) {
    selectedWeights[type] = (selectedWeights[type] || 0) / totalWeight;
  }
  
  // Generate questions based on distribution
  for (let i = 0; i < questionCount; i++) {
    const random = Math.random();
    let cumulative = 0;
    let selectedType = questionTypes[0]; // fallback to first selected type
    
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