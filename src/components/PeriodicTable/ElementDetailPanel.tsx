// Element Detail Panel Component

import React from 'react';
import type { Element } from '../../types';
import { useFavorites, useFlashCards, useNotes } from '../../hooks';
import { t, getElementName } from '../../utils/i18n';

interface ElementDetailPanelProps {
  element: Element | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const ElementDetailPanel: React.FC<ElementDetailPanelProps> = ({ element, isOpen, onClose }) => {
  const { toggleElement, isElementFavorite } = useFavorites();
  const { createCard } = useFlashCards();
  const { createNote, getNotesByElement } = useNotes();

  if (!element) return null;

  const isFavorite = isElementFavorite(element.z);
  const elementNotes = getNotesByElement(element.z);

  const handleAddToFavorites = () => {
    toggleElement(element.z);
  };

  const handleCreateFlashcard = () => {
    createCard({
      front_tr: element.symbol,
      front_en: element.symbol,
      back_tr: element.name_tr,
      back_en: element.name_en,
      element_id: element.z,
      tags: ['sembol', 'element'],
      leitner_box: 1,
      next_review: new Date(),
      correct_count: 0,
      incorrect_count: 0
    });
    
    // Show success notification (simplified)
    alert(t('flashcards.create') + ' - ' + getElementName(element));
  };

  const handleAddNote = () => {
    const title = `${getElementName(element)} ${t('notes.title')}`;
    const content = `${t('element.atomic-number')}: ${element.z}\n${t('element.electron-config')}: ${element.electron_config}`;
    
    createNote({
      title,
      content,
      element_id: element.z,
      tags: ['element', element.symbol.toLowerCase()]
    });
    
    alert(t('notes.create') + ' - ' + getElementName(element));
  };

  const formatValue = (value: number | undefined, unit: string) => {
    return value ? `${value} ${unit}` : '-';
  };

  const formatArray = (arr: number[]) => {
    return arr.length > 0 ? arr.join(', ') : '-';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`detail-panel-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{getElementName(element)}</h2>
          <button
            onClick={onClose}
            className="btn btn-sm"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        {/* Element Header */}
        <div className={`card mb-6 element-${element.category}`}>
          <div className="text-center text-white">
            <div className="text-4xl font-bold mb-2">{element.symbol}</div>
            <div className="text-lg opacity-90">{getElementName(element)}</div>
            <div className="text-sm opacity-75">{element.z} • {element.mass} u</div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleAddToFavorites}
            className={`btn ${isFavorite ? 'btn-primary' : ''}`}
          >
            {isFavorite ? '⭐' : '☆'} {t('element.add-favorite')}
          </button>
          <button
            onClick={handleCreateFlashcard}
            className="btn"
          >
            📚 {t('element.create-flashcard')}
          </button>
          <button
            onClick={handleAddNote}
            className="btn"
          >
            📝 {t('element.add-note')}
          </button>
          <button className="btn">
            🧪 {t('element.add-to-quiz')}
          </button>
        </div>

        {/* Properties */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('element.properties')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{t('element.atomic-number')}:</span>
                <span className="font-semibold">{element.z}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.atomic-mass')}:</span>
                <span className="font-semibold">{element.mass} {t('units.amu')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.electron-config')}:</span>
                <span className="font-semibold text-sm">{element.electron_config}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.oxidation-states')}:</span>
                <span className="font-semibold">{formatArray(element.oxidation_states)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.melting-point')}:</span>
                <span className="font-semibold">{formatValue(element.melting_point, t('units.kelvin'))}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.boiling-point')}:</span>
                <span className="font-semibold">{formatValue(element.boiling_point, t('units.kelvin'))}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.density')}:</span>
                <span className="font-semibold">{formatValue(element.density, t('units.gram-per-cm3'))}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.electronegativity')}:</span>
                <span className="font-semibold">{formatValue(element.electronegativity, '')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.atomic-radius')}:</span>
                <span className="font-semibold">{formatValue(element.atomic_radius, t('units.picometer'))}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.ionization-energy')}:</span>
                <span className="font-semibold">{formatArray(element.ionization_energy)} {t('units.electron-volt')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.phase')}:</span>
                <span className="font-semibold">{t(`phase.${element.phase_at_stp}`)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('element.discovery-year')}:</span>
                <span className="font-semibold">{element.discovery_year || '-'}</span>
              </div>
              {element.discovered_by && (
                <div className="flex justify-between">
                  <span>{t('element.discovered-by')}:</span>
                  <span className="font-semibold text-sm">{element.discovered_by}</span>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Kategori</h3>
            <div className={`card element-${element.category} text-white text-center`}>
              {t(`category.${element.category}`)}
            </div>
          </div>

          {/* Trends Visualization (Simple) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Trendler</h3>
            <div className="space-y-2">
              {element.electronegativity && (
                <div className="flex items-center gap-3">
                  <span className="text-sm w-24">Elektronegatiflik:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand h-2 rounded-full"
                      style={{ width: `${(element.electronegativity / 4) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8">{element.electronegativity}</span>
                </div>
              )}
              {element.atomic_radius && (
                <div className="flex items-center gap-3">
                  <span className="text-sm w-24">Atom Yarıçapı:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${Math.min((element.atomic_radius / 300) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8">{element.atomic_radius}</span>
                </div>
              )}
            </div>
          </div>

          {/* Related Notes */}
          {elementNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">İlgili Notlar ({elementNotes.length})</h3>
              <div className="space-y-2">
                {elementNotes.slice(0, 3).map(note => (
                  <div key={note.id} className="card card-compact">
                    <div className="text-sm font-medium">{note.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {note.content.slice(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ElementDetailPanel;