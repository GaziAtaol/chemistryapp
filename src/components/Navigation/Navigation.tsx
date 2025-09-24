// Main navigation component

import React from 'react';
import { t } from '../../utils/i18n';
import { playButtonClickSound } from '../../utils/audio';
import logoImg from '../../assets/logo-newest.png';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onToggleCalculator: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, onToggleCalculator }) => {
  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard') },
    { id: 'periodic-table', label: t('nav.periodic-table') },
    { id: 'quiz', label: t('nav.quiz') },
    { id: 'flashcards', label: t('nav.flashcards') },
    { id: 'favorites', label: t('nav.favorites') },
    { id: 'achievements', label: t('nav.achievements') },
    { id: 'history', label: t('nav.history') },
    { id: 'notes', label: t('nav.notes') },
    { id: 'settings', label: t('nav.settings') }
  ];

  const handleCalculatorClick = () => {
    playButtonClickSound();
    onToggleCalculator();
  };

  return (
    <nav className="nav">
      <div className="container">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Chemfy Logo" className="logo-nav" />
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`nav-btn ${currentPage === item.id ? 'nav-btn-active' : ''}`}
                title={item.label}
              >
                <span className="nav-btn-text">{item.label}</span>
                <div className="nav-btn-glow"></div>
              </button>
            ))}
            {/* Calculator button for future feature */}
            <button
              onClick={handleCalculatorClick}
              className="nav-btn nav-btn-special"
              title={t('nav.calculator')}
            >
              <span className="nav-btn-text">🧮 {t('nav.calculator')}</span>
              <div className="nav-btn-glow"></div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;