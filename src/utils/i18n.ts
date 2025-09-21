// Internationalization utilities

export const translations = {
  tr: {
    // Navigation
    'nav.dashboard': 'Ana Sayfa',
    'nav.periodic-table': 'Periyodik Tablo',
    'nav.quiz': 'Quiz',
    'nav.flashcards': 'Kartlar',
    'nav.favorites': 'Favoriler',
    'nav.history': 'Geçmiş',
    'nav.notes': 'Notlar',
    'nav.settings': 'Ayarlar',
    
    // Dashboard
    'dashboard.title': 'Kimya Öğrenme Uygulaması',
    'dashboard.welcome': 'Hoş geldiniz',
    'dashboard.daily-cards': 'Bugünkü Kartlar',
    'dashboard.last-quiz': 'Son Quiz Skoru',
    'dashboard.quick-search': 'Hızlı Arama',
    'dashboard.recent-favorites': 'Son Favoriler',
    
    // Periodic Table
    'pt.title': 'Periyodik Tablo',
    'pt.search': 'Element ara...',
    'pt.filter.all': 'Tümü',
    'pt.filter.metals': 'Metaller',
    'pt.filter.nonmetals': 'Ametaller',
    'pt.filter.metalloids': 'Yarımetaller',
    'pt.block.s': 's blok',
    'pt.block.p': 'p blok',
    'pt.block.d': 'd blok',
    'pt.block.f': 'f blok',
    
    // Element Details
    'element.properties': 'Özellikler',
    'element.atomic-number': 'Atom Numarası',
    'element.atomic-mass': 'Atom Kütlesi',
    'element.electron-config': 'Elektron Dizilimi',
    'element.oxidation-states': 'Oksidasyon Halleri',
    'element.melting-point': 'Erime Noktası',
    'element.boiling-point': 'Kaynama Noktası',
    'element.density': 'Yoğunluk',
    'element.electronegativity': 'Elektronegatiflik',
    'element.atomic-radius': 'Atom Yarıçapı',
    'element.ionization-energy': 'İyonlaşma Enerjisi',
    'element.discovery-year': 'Keşif Yılı',
    'element.discovered-by': 'Keşfeden',
    'element.phase': 'Faz (STP)',
    'element.add-favorite': 'Favorilere Ekle',
    'element.create-flashcard': 'Kart Oluştur',
    'element.add-note': 'Not Ekle',
    'element.add-to-quiz': 'Quiz\'e Ekle',
    
    // Quiz
    'quiz.title': 'Quiz',
    'quiz.start': 'Quiz Başlat',
    'quiz.config': 'Quiz Ayarları',
    'quiz.difficulty': 'Zorluk',
    'quiz.difficulty.easy': 'Kolay',
    'quiz.difficulty.medium': 'Orta',
    'quiz.difficulty.hard': 'Zor',
    'quiz.question-count': 'Soru Sayısı',
    'quiz.time-limit': 'Süre Sınırı',
    'quiz.question-types': 'Soru Tipleri',
    'quiz.multiple-choice': 'Çoktan Seçmeli',
    'quiz.matching': 'Eşleştirme',
    'quiz.fill-blank': 'Boşluk Doldurma',
    'quiz.true-false': 'Doğru/Yanlış',
    'quiz.electron-config': 'Elektron Dizilimi',
    'quiz.periodic-trend': 'Periyodik Trend',
    'quiz.submit': 'Cevabı Gönder',
    'quiz.next': 'Sonraki Soru',
    'quiz.finish': 'Quiz\'i Bitir',
    'quiz.score': 'Skor',
    'quiz.time-taken': 'Geçen Süre',
    'quiz.correct': 'Doğru',
    'quiz.incorrect': 'Yanlış',
    'quiz.explanation': 'Açıklama',
    
    // Flashcards
    'flashcards.title': 'Kartlar',
    'flashcards.study': 'Çalışma',
    'flashcards.create': 'Yeni Kart',
    'flashcards.leitner-boxes': 'Leitner Kutuları',
    'flashcards.box': 'Kutu',
    'flashcards.cards-due': 'Çalışılacak Kartlar',
    'flashcards.flip': 'Çevir',
    'flashcards.know': 'Biliyorum',
    'flashcards.dont-know': 'Bilmiyorum',
    'flashcards.front': 'Ön Yüz',
    'flashcards.back': 'Arka Yüz',
    'flashcards.tags': 'Etiketler',
    'flashcards.next-review': 'Sonraki Tekrar',
    
    // Favorites
    'favorites.title': 'Favoriler',
    'favorites.elements': 'Elementler',
    'favorites.questions': 'Sorular',
    'favorites.flashcards': 'Kartlar',
    'favorites.notes': 'Notlar',
    'favorites.empty': 'Henüz favori eklenmemiş',
    'favorites.add-some': 'Favori eklemek için elementlere, sorulara veya kartlara tıklayın',
    
    // Notes
    'notes.title': 'Notlar',
    'notes.create': 'Yeni Not',
    'notes.edit': 'Düzenle',
    'notes.delete': 'Sil',
    'notes.save': 'Kaydet',
    'notes.cancel': 'İptal',
    'notes.title-placeholder': 'Not başlığı...',
    'notes.content-placeholder': 'Notunuzu buraya yazın...',
    'notes.search': 'Notlarda ara...',
    'notes.empty': 'Henüz not eklenmemiş',
    
    // Settings
    'settings.title': 'Ayarlar',
    'settings.language': 'Dil',
    'settings.theme': 'Tema',
    'settings.theme.light': 'Açık',
    'settings.theme.dark': 'Koyu',
    'settings.font-size': 'Font Boyutu',
    'settings.font-size.small': 'Küçük',
    'settings.font-size.medium': 'Orta',
    'settings.font-size.large': 'Büyük',
    'settings.daily-target': 'Günlük Kart Hedefi',
    'settings.notifications': 'Bildirimler',
    'settings.data': 'Veri Yönetimi',
    'settings.export': 'Dışa Aktar',
    'settings.import': 'İçe Aktar',
    'settings.reset': 'Sıfırla',
    'settings.load-sample': 'Örnek Veri Yükle',
    
    // Common
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.close': 'Kapat',
    'common.loading': 'Yükleniyor...',
    'common.search': 'Ara...',
    'common.filter': 'Filtrele',
    'common.sort': 'Sırala',
    'common.yes': 'Evet',
    'common.no': 'Hayır',
    'common.ok': 'Tamam',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'common.warning': 'Uyarı',
    
    // Units
    'units.kelvin': 'K',
    'units.celsius': '°C',
    'units.gram-per-cm3': 'g/cm³',
    'units.picometer': 'pm',
    'units.electron-volt': 'eV',
    'units.amu': 'u',
    
    // Categories
    'category.alkali-metal': 'Alkali Metal',
    'category.alkaline-earth-metal': 'Toprak Alkali Metal',
    'category.transition-metal': 'Geçiş Metali',
    'category.post-transition-metal': 'Geçiş Sonrası Metal',
    'category.metalloid': 'Yarımetal',
    'category.nonmetal': 'Ametal',
    'category.halogen': 'Halojen',
    'category.noble-gas': 'Soygaz',
    'category.lanthanide': 'Lantanit',
    'category.actinide': 'Aktinit',
    
    // Phases
    'phase.solid': 'Katı',
    'phase.liquid': 'Sıvı',
    'phase.gas': 'Gaz'
  },
  
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.periodic-table': 'Periodic Table',
    'nav.quiz': 'Quiz',
    'nav.flashcards': 'Flashcards',
    'nav.favorites': 'Favorites',
    'nav.history': 'History',
    'nav.notes': 'Notes',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Chemistry Learning App',
    'dashboard.welcome': 'Welcome',
    'dashboard.daily-cards': 'Daily Cards',
    'dashboard.last-quiz': 'Last Quiz Score',
    'dashboard.quick-search': 'Quick Search',
    'dashboard.recent-favorites': 'Recent Favorites',
    
    // Periodic Table
    'pt.title': 'Periodic Table',
    'pt.search': 'Search elements...',
    'pt.filter.all': 'All',
    'pt.filter.metals': 'Metals',
    'pt.filter.nonmetals': 'Nonmetals',
    'pt.filter.metalloids': 'Metalloids',
    'pt.block.s': 's block',
    'pt.block.p': 'p block',
    'pt.block.d': 'd block',
    'pt.block.f': 'f block',
    
    // Element Details
    'element.properties': 'Properties',
    'element.atomic-number': 'Atomic Number',
    'element.atomic-mass': 'Atomic Mass',
    'element.electron-config': 'Electron Configuration',
    'element.oxidation-states': 'Oxidation States',
    'element.melting-point': 'Melting Point',
    'element.boiling-point': 'Boiling Point',
    'element.density': 'Density',
    'element.electronegativity': 'Electronegativity',
    'element.atomic-radius': 'Atomic Radius',
    'element.ionization-energy': 'Ionization Energy',
    'element.discovery-year': 'Discovery Year',
    'element.discovered-by': 'Discovered By',
    'element.phase': 'Phase (STP)',
    'element.add-favorite': 'Add to Favorites',
    'element.create-flashcard': 'Create Flashcard',
    'element.add-note': 'Add Note',
    'element.add-to-quiz': 'Add to Quiz',
    
    // Quiz
    'quiz.title': 'Quiz',
    'quiz.start': 'Start Quiz',
    'quiz.config': 'Quiz Configuration',
    'quiz.difficulty': 'Difficulty',
    'quiz.difficulty.easy': 'Easy',
    'quiz.difficulty.medium': 'Medium',
    'quiz.difficulty.hard': 'Hard',
    'quiz.question-count': 'Number of Questions',
    'quiz.time-limit': 'Time Limit',
    'quiz.question-types': 'Question Types',
    'quiz.multiple-choice': 'Multiple Choice',
    'quiz.matching': 'Matching',
    'quiz.fill-blank': 'Fill in the Blank',
    'quiz.true-false': 'True/False',
    'quiz.electron-config': 'Electron Configuration',
    'quiz.periodic-trend': 'Periodic Trend',
    'quiz.submit': 'Submit Answer',
    'quiz.next': 'Next Question',
    'quiz.finish': 'Finish Quiz',
    'quiz.score': 'Score',
    'quiz.time-taken': 'Time Taken',
    'quiz.correct': 'Correct',
    'quiz.incorrect': 'Incorrect',
    'quiz.explanation': 'Explanation',
    
    // Flashcards
    'flashcards.title': 'Flashcards',
    'flashcards.study': 'Study',
    'flashcards.create': 'New Card',
    'flashcards.leitner-boxes': 'Leitner Boxes',
    'flashcards.box': 'Box',
    'flashcards.cards-due': 'Cards Due',
    'flashcards.flip': 'Flip',
    'flashcards.know': 'I Know',
    'flashcards.dont-know': 'I Don\'t Know',
    'flashcards.front': 'Front',
    'flashcards.back': 'Back',
    'flashcards.tags': 'Tags',
    'flashcards.next-review': 'Next Review',
    
    // Favorites
    'favorites.title': 'Favorites',
    'favorites.elements': 'Elements',
    'favorites.questions': 'Questions',
    'favorites.flashcards': 'Flashcards',
    'favorites.notes': 'Notes',
    'favorites.empty': 'No favorites yet',
    'favorites.add-some': 'Click on elements, questions, or cards to add favorites',
    
    // Notes
    'notes.title': 'Notes',
    'notes.create': 'New Note',
    'notes.edit': 'Edit',
    'notes.delete': 'Delete',
    'notes.save': 'Save',
    'notes.cancel': 'Cancel',
    'notes.title-placeholder': 'Note title...',
    'notes.content-placeholder': 'Write your note here...',
    'notes.search': 'Search notes...',
    'notes.empty': 'No notes yet',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.font-size': 'Font Size',
    'settings.font-size.small': 'Small',
    'settings.font-size.medium': 'Medium',
    'settings.font-size.large': 'Large',
    'settings.daily-target': 'Daily Card Target',
    'settings.notifications': 'Notifications',
    'settings.data': 'Data Management',
    'settings.export': 'Export',
    'settings.import': 'Import',
    'settings.reset': 'Reset',
    'settings.load-sample': 'Load Sample Data',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    
    // Units
    'units.kelvin': 'K',
    'units.celsius': '°C',
    'units.gram-per-cm3': 'g/cm³',
    'units.picometer': 'pm',
    'units.electron-volt': 'eV',
    'units.amu': 'u',
    
    // Categories
    'category.alkali-metal': 'Alkali Metal',
    'category.alkaline-earth-metal': 'Alkaline Earth Metal',
    'category.transition-metal': 'Transition Metal',
    'category.post-transition-metal': 'Post-transition Metal',
    'category.metalloid': 'Metalloid',
    'category.nonmetal': 'Nonmetal',
    'category.halogen': 'Halogen',
    'category.noble-gas': 'Noble Gas',
    'category.lanthanide': 'Lanthanide',
    'category.actinide': 'Actinide',
    
    // Phases
    'phase.solid': 'Solid',
    'phase.liquid': 'Liquid',
    'phase.gas': 'Gas'
  }
};

export type Language = 'tr' | 'en';
export type TranslationKey = keyof typeof translations.tr;

let currentLanguage: Language = 'tr';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  document.documentElement.lang = lang;
};

export const getLanguage = (): Language => currentLanguage;

export const t = (key: TranslationKey): string => {
  return translations[currentLanguage][key] || key;
};

export const getElementName = (element: { name_tr: string; name_en: string }): string => {
  return currentLanguage === 'tr' ? element.name_tr : element.name_en;
};