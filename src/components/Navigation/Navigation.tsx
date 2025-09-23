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
    { id: 'dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { id: 'periodic-table', label: t('nav.periodic-table'), icon: '🧪' },
    { id: 'quiz', label: t('nav.quiz'), icon: '❓' },
    { id: 'flashcards', label: t('nav.flashcards'), icon: '📚' },
    { id: 'favorites', label: t('nav.favorites'), icon: '⭐' },
    { id: 'history', label: t('nav.history'), icon: '📊' },
    { id: 'notes', label: t('nav.notes'), icon: '📝' },
    { id: 'settings', label: t('nav.settings'), icon: '⚙️' }
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
          
          <div className="flex items-center gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                title={item.label}
              >
                <span className="mr-2">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;