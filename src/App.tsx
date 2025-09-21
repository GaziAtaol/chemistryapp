import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import PeriodicTable from './components/PeriodicTable/PeriodicTable';
import ElementDetailPanel from './components/PeriodicTable/ElementDetailPanel';
import Quiz from './components/Quiz/Quiz';
import PageContainer from './components/PageContainer/PageContainer';
import type { Element } from './types';
import { useSettings, useAppData } from './hooks';
import { t } from './utils/i18n';
import './styles/main.css';

// Page components (simplified for now)
const Dashboard: React.FC = () => {
  const { data } = useAppData();
  
  return (
    <PageContainer title="🏠 Pano">
      <div className="grid grid-auto gap-6">
        <div className="quiz-question-card">
          <h3 className="text-lg font-semibold mb-3 text-brand">{t('dashboard.daily-cards')}</h3>
          <div className="text-2xl font-bold text-brand">
            {data.flashcards.filter(card => new Date(card.next_review) <= new Date()).length}
          </div>
        </div>
        <div className="quiz-question-card">
          <h3 className="text-lg font-semibold mb-3 text-accent">{t('dashboard.last-quiz')}</h3>
          <div className="text-2xl font-bold text-accent">
            {data.quiz_sessions.length > 0 
              ? `${Math.round(data.quiz_sessions[data.quiz_sessions.length - 1].score)}%`
              : '-'
            }
          </div>
        </div>
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
  <PageContainer title="🃏 Kartlar">
    <div className="quiz-question-card">
      <p>Flashcard bileşeni yakında gelecek...</p>
    </div>
  </PageContainer>
);

const Favorites: React.FC = () => (
  <PageContainer title="⭐ Favoriler">
    <div className="quiz-question-card">
      <p>Favoriler bileşeni yakında gelecek...</p>
    </div>
  </PageContainer>
);

const History: React.FC = () => (
  <PageContainer title="📜 Geçmiş">
    <div className="quiz-question-card">
      <p>Geçmiş bileşeni yakında gelecek...</p>
    </div>
  </PageContainer>
);

const Notes: React.FC = () => (
  <PageContainer title="📝 Notlar">
    <div className="quiz-question-card">
      <p>Notlar bileşeni yakında gelecek...</p>
    </div>
  </PageContainer>
);

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <PageContainer title="⚙️ Ayarlar">
      <div className="max-w-2xl mx-auto">
        <div className="quiz-question-card space-y-6">
          {/* Language Setting */}
          <div>
            <label className="block text-sm font-medium mb-2 text-brand">{t('settings.language')}</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as 'tr' | 'en' })}
              className="input w-full"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Theme Setting */}
          <div>
            <label className="block text-sm font-medium mb-2 text-brand">{t('settings.theme')}</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
              className="input w-full"
            >
              <option value="light">{t('settings.theme.light')}</option>
              <option value="dark">{t('settings.theme.dark')}</option>
            </select>
          </div>

          {/* Font Size Setting */}
          <div>
            <label className="block text-sm font-medium mb-2 text-brand">{t('settings.font-size')}</label>
            <select
              value={settings.font_size}
              onChange={(e) => updateSettings({ font_size: e.target.value as 'small' | 'medium' | 'large' })}
              className="input w-full"
            >
              <option value="small">{t('settings.font-size.small')}</option>
              <option value="medium">{t('settings.font-size.medium')}</option>
              <option value="large">{t('settings.font-size.large')}</option>
            </select>
          </div>

          {/* Daily Target */}
          <div>
            <label className="block text-sm font-medium mb-2 text-brand">{t('settings.daily-target')}</label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.daily_flashcard_target}
              onChange={(e) => updateSettings({ daily_flashcard_target: parseInt(e.target.value) || 20 })}
              className="input w-full"
            />
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
  const { settings } = useSettings();

  // Initialize app theme and language
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-font-size', settings.font_size);
    document.documentElement.lang = settings.language;
  }, [settings]);

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
      case 'history':
        return <History />;
      case 'notes':
        return <Notes />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
