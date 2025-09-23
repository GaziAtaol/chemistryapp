// Main navigation component

import React from 'react';
import { t } from '../../utils/i18n';
import logoImg from '../../assets/logo-newest.png';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Pano' },
    { id: 'periodic-table', label: t('nav.periodic-table') },
    { id: 'quiz', label: t('nav.quiz') },
    { id: 'flashcards', label: t('nav.flashcards') },
    { id: 'favorites', label: 'Favoriler' },
    { id: 'history', label: t('nav.history') },
    { id: 'notes', label: t('nav.notes') },
    { id: 'settings', label: t('nav.settings') }
  ];

  return (
    <nav className="nav">
      <div className="container">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-brand mr-8 flex items-center">
              <img src={logoImg} alt="Chemfy Logo" className="logo-nav" />
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;