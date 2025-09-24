import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import PeriodicTable from './components/PeriodicTable/PeriodicTable';
import ElementDetailPanel from './components/PeriodicTable/ElementDetailPanel';
import Quiz from './components/Quiz/Quiz';
import QuizHistory from './components/QuizHistory/QuizHistory';
import PageContainer from './components/PageContainer/PageContainer';
import Notes from './components/Notes/Notes';
import Calculator from './components/Calculator/Calculator';
import FlashCardApp from './components/FlashCard';
import Achievements from './components/Achievements';
import AchievementManager from './components/AchievementToast/AchievementManager';
import type { Element } from './types';
import { useSettings, useAppData, useFavorites, useProgress } from './hooks';
import { t, getElementName } from './utils/i18n';
import { playButtonClickSound, preloadAudioFiles } from './utils/audio';
import './styles/main.css';

// Page components (simplified for now)
const Dashboard: React.FC = () => {
  const { data } = useAppData();
  const { progress, isDailyTargetReached, getDailyProgressPercentage } = useProgress();
  
  // Format last quiz date
  const formatLastQuizDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const targetReached = isDailyTargetReached();
  const progressPercentage = getDailyProgressPercentage();
  
  return (
    <PageContainer title={t('dashboard.page-title')}>
      <div className="grid grid-auto gap-6">
        {/* Today's Flashcards Card */}
        <div className={`quiz-question-card ${targetReached ? 'border-green-500 bg-green-50' : ''}`}>
          <h3 className="text-lg font-semibold mb-3 text-brand">{t('dashboard.daily-cards')}</h3>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-brand">
              {progress.daily.flashcardsDone} / {progress.daily.flashcardsTarget}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  targetReached ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {targetReached ? '🎉 Günlük hedef tamamlandı!' : `${Math.round(progressPercentage)}% tamamlandı`}
            </div>
          </div>
        </div>

        {/* Last Quiz Score Card */}
        <div className="quiz-question-card">
          <h3 className="text-lg font-semibold mb-3 text-accent">{t('dashboard.last-quiz')}</h3>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent">
              {progress.quiz.lastScore > 0 
                ? `${Math.round(progress.quiz.lastScore * 10) / 10}%`
                : '—'
              }
            </div>
            {progress.quiz.lastTakenAt && (
              <div className="text-sm text-gray-600">
                {formatLastQuizDate(progress.quiz.lastTakenAt)}
              </div>
            )}
          </div>
        </div>

        {/* Favorites Card */}
        <div className="quiz-question-card">
          <h3 className="text-lg font-semibold mb-3 text-warning">{t('favorites.title')}</h3>
          <div className="text-2xl font-bold text-warning">
            {data.favorites.elements.length + data.favorites.flashcards.length + data.favorites.notes.length}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};


const FlashCards: React.FC = () => (
  <PageContainer title={t('flashcards.page-title')}>
    <FlashCardApp />
  </PageContainer>
);

// Favorite Element Cell Component (similar to periodic table element cell)
interface FavoriteElementCellProps {
  element: Element;
  onClick: (element: Element) => void;
  isSelected?: boolean;
}

const FavoriteElementCell: React.FC<FavoriteElementCellProps> = ({ element, onClick, isSelected }) => {
  const { isElementFavorite } = useFavorites();
  const isFavorite = isElementFavorite(element.z);
  
  const handleClick = () => {
    playButtonClickSound();
    onClick(element);
  };
  
  return (
    <div
      className={`element-cell element-${element.category} ${isSelected ? 'selected' : ''} relative group`}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`${getElementName(element)}, ${t('element.atomic-number')} ${element.z}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="element-number">{element.z}</div>
      <div className="element-symbol">{element.symbol}</div>
      <div className="element-name">{getElementName(element).slice(0, 8)}</div>
      
      {/* Icons overlay */}
      <div className="absolute top-1 right-1 flex flex-col gap-1">
        {isFavorite && <div className="text-yellow-400 text-xs">⭐</div>}
      </div>
    </div>
  );
};

const Favorites: React.FC = () => {
  const { data } = useAppData();
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  // Filter elements to get only favorites and sort by atomic number
  const favoriteElements = data.elements
    .filter(element => data.favorites.elements.includes(element.z))
    .sort((a, b) => a.z - b.z);

  return (
    <PageContainer title={t('favorites.page-title')}>
      {favoriteElements.length === 0 ? (
        <div className="quiz-question-card">
          <p>Henüz favori element eklemediniz. Periyodik tabloda elementlere tıklayarak favorilere ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="periodic-table-container">
          <div className="favorites-grid">
            {favoriteElements.map(element => (
              <FavoriteElementCell 
                key={element.z}
                element={element}
                onClick={setSelectedElement}
                isSelected={selectedElement?.z === element.z}
              />
            ))}
          </div>
        </div>
      )}
      
      {selectedElement && (
        <ElementDetailPanel
          element={selectedElement}
          isOpen={true}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </PageContainer>
  );
};

const History: React.FC = () => (
  <PageContainer title={t('history.page-title')}>
    <QuizHistory />
  </PageContainer>
);

const NotesPage: React.FC = () => (
  <PageContainer title={t('notes.page-title')}>
    <Notes />
  </PageContainer>
);

const AchievementsPage: React.FC = () => (
  <PageContainer>
    <Achievements />
  </PageContainer>
);

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  const handleButtonClick = () => {
    playButtonClickSound();
  };
  
  return (
    <PageContainer title={t('settings.page-title')}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-2 gap-6">
          {/* Personal Settings */}
          <div className="quiz-question-card">
            <h3 className="text-xl font-semibold mb-6 text-brand">{t('settings.personal')}</h3>
            <div className="space-y-6">
              {/* Language Setting */}
              <div>
                <label className="block text-sm font-medium mb-3 text-brand">{t('settings.language')}</label>
                <div className="settings-options">
                  <label className="option-card" onClick={() => playButtonClickSound()}>
                    <input
                      type="radio"
                      name="language"
                      value="tr"
                      checked={settings.language === 'tr'}
                      onChange={(e) => updateSettings({ language: e.target.value as 'tr' | 'en' })}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text">🇹🇷 Türkçe</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                  <label className="option-card" onClick={() => playButtonClickSound()}>
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={settings.language === 'en'}
                      onChange={(e) => updateSettings({ language: e.target.value as 'tr' | 'en' })}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text">🇺🇸 English</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                </div>
              </div>

              {/* Theme Setting */}
              <div>
                <label className="block text-sm font-medium mb-3 text-brand">{t('settings.theme')}</label>
                <div className="settings-options">
                  <label className="option-card" onClick={() => playButtonClickSound()}>
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={settings.theme === 'light'}
                      onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text">☀️ {t('settings.theme.light')}</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                  <label className="option-card" onClick={() => playButtonClickSound()}>
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={settings.theme === 'dark'}
                      onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text">🌙 {t('settings.theme.dark')}</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                </div>
              </div>

              {/* Font Size Setting */}
              <div>
                <label className="block text-sm font-medium mb-3 text-brand">{t('settings.font-size')}</label>
                <div className="settings-options settings-options-3">
                  <label className="option-card" onClick={() => playButtonClickSound()}>
                    <input
                      type="radio"
                      name="font_size"
                      value="small"
                      checked={settings.font_size === 'small'}
                      onChange={(e) => updateSettings({ font_size: e.target.value as 'small' | 'medium' | 'large' })}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text text-xs">📝 {t('settings.font-size.small')}</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                  <label className="option-card" onClick={() => playButtonClickSound()}>
                    <input
                      type="radio"
                      name="font_size"
                      value="medium"
                      checked={settings.font_size === 'medium'}
                      onChange={(e) => updateSettings({ font_size: e.target.value as 'small' | 'medium' | 'large' })}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text text-sm">📄 {t('settings.font-size.medium')}</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                  <label className="option-card" onClick={() => playButtonClickSound()}>
                    <input
                      type="radio"
                      name="font_size"
                      value="large"
                      checked={settings.font_size === 'large'}
                      onChange={(e) => updateSettings({ font_size: e.target.value as 'small' | 'medium' | 'large' })}
                      className="option-input"
                    />
                    <div className="option-content">
                      <div className="option-indicator">
                        <div className="option-radio"></div>
                      </div>
                      <span className="option-text text-lg">📋 {t('settings.font-size.large')}</span>
                    </div>
                    <div className="option-glow"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Settings */}
          <div className="quiz-question-card">
            <h3 className="text-xl font-semibold mb-6 text-brand">{t('settings.learning')}</h3>
            <div className="space-y-6">
              {/* Daily Target */}
              <div>
                <label className="block text-sm font-medium mb-3 text-brand">{t('settings.daily-target')}</label>
                <div className="settings-slider">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={settings.daily_flashcard_target}
                    onChange={(e) => updateSettings({ daily_flashcard_target: parseInt(e.target.value) })}
                    className="slider"
                  />
                  <div className="slider-value">
                    <span className="text-2xl font-bold text-brand">{settings.daily_flashcard_target}</span>
                    <span className="text-sm text-muted">kart/gün</span>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-medium mb-3 text-brand">🔔 {t('settings.notifications')}</label>
                <div className="settings-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Günlük hatırlatmalar</span>
                  </label>
                </div>
              </div>

              {/* Auto-save */}
              <div>
                <label className="block text-sm font-medium mb-3 text-brand">💾 Otomatik Kaydetme</label>
                <div className="settings-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">İlerlemeyi otomatik kaydet</span>
                  </label>
                </div>
              </div>

              {/* Sound Effects */}
              <div>
                <label className="block text-sm font-medium mb-3 text-brand">🔊 Ses Efektleri</label>
                <div className="settings-toggle">
                  <label className="toggle-switch" onClick={() => playButtonClickSound()}>
                    <input
                      type="checkbox"
                      checked={settings.sound_effects.button_clicks}
                      onChange={(e) => updateSettings({ 
                        sound_effects: { 
                          ...settings.sound_effects, 
                          button_clicks: e.target.checked 
                        } 
                      })}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">🖱️ Buton tıklama sesleri</span>
                  </label>
                </div>
                <div className="settings-toggle">
                  <label className="toggle-switch" onClick={() => playButtonClickSound()}>
                    <input
                      type="checkbox"
                      checked={settings.sound_effects.next_question}
                      onChange={(e) => updateSettings({ 
                        sound_effects: { 
                          ...settings.sound_effects, 
                          next_question: e.target.checked 
                        } 
                      })}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">➡️ Sonraki soru sesleri</span>
                  </label>
                </div>
                <div className="settings-toggle">
                  <label className="toggle-switch" onClick={() => playButtonClickSound()}>
                    <input
                      type="checkbox"
                      checked={settings.sound_effects.quiz_success}
                      onChange={(e) => updateSettings({ 
                        sound_effects: { 
                          ...settings.sound_effects, 
                          quiz_success: e.target.checked 
                        } 
                      })}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">🎉 Quiz başarı sesleri</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="quiz-question-card mt-6">
          <h3 className="text-xl font-semibold mb-6 text-brand">🗂️ Veri Yönetimi</h3>
          <div className="grid grid-3 gap-4">
            <button className="btn btn-secondary" onClick={handleButtonClick}>
              <span>📤</span>
              {t('settings.export')}
            </button>
            <button className="btn btn-secondary" onClick={handleButtonClick}>
              <span>📥</span>
              {t('settings.import')}
            </button>
            <button className="btn btn-danger" onClick={handleButtonClick}>
              <span>🗑️</span>
              {t('settings.reset')}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

const PeriodicTablePage: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<Element | undefined>(undefined);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const handleElementSelect = (element: Element) => {
    setSelectedElement(element);
    setDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setDetailPanelOpen(false);
    // Keep selected element for visual feedback
  };

  return (
    <PageContainer title="🧪 Periyodik Tablo">
      <div className="quiz-question-card">
        <PeriodicTable
          onElementSelect={handleElementSelect}
          selectedElement={selectedElement}
        />
      </div>
      
      <ElementDetailPanel
        element={selectedElement}
        isOpen={detailPanelOpen}
        onClose={handleCloseDetailPanel}
      />
    </PageContainer>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const { settings } = useSettings();

  // Initialize app theme and language
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-font-size', settings.font_size);
    document.documentElement.lang = settings.language;
  }, [settings]);

  // Preload audio files on app initialization
  useEffect(() => {
    preloadAudioFiles();
  }, []);

  const handlePageChange = (page: string) => {
    playButtonClickSound();
    setCurrentPage(page);
  };

  const handleToggleCalculator = () => {
    playButtonClickSound();
    setIsCalculatorVisible(!isCalculatorVisible);
  };

  const handleCloseCalculator = () => {
    setIsCalculatorVisible(false);
  };

  const handleNavigateToAchievements = () => {
    setCurrentPage('achievements');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'periodic-table':
        return <PeriodicTablePage />;
      case 'quiz':
        return <Quiz />;
      case 'flashcards':
        return <FlashCards />;
      case 'favorites':
        return <Favorites />;
      case 'achievements':
        return <AchievementsPage />;
      case 'history':
        return <History />;
      case 'notes':
        return <NotesPage />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        onToggleCalculator={handleToggleCalculator}
      />
      <main>{renderPage()}</main>
      <Calculator 
        isVisible={isCalculatorVisible}
        onClose={handleCloseCalculator}
      />
      
      {/* Achievement Toast Manager */}
      <AchievementManager 
        onNavigateToAchievements={handleNavigateToAchievements}
      />
    </div>
  );
}

export default App;
