// Element Detail Panel Component

import React, { useState, useRef } from 'react';
import type { Element } from '../../types';
import { useFavorites, useFlashCards, useNotes } from '../../hooks';
import { t, getElementName } from '../../utils/i18n';
import { generateTrendExplanations } from '../../utils/trendExplanations';
import CompactNoteForm from './CompactNoteForm';

interface ElementDetailPanelProps {
  element: Element | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const ElementDetailPanel: React.FC<ElementDetailPanelProps> = ({ element, isOpen, onClose }) => {
  const { toggleElement, isElementFavorite } = useFavorites();
  const { createCard } = useFlashCards();
  const { getNotesByElement } = useNotes();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const noteButtonRef = useRef<HTMLButtonElement>(null);

  if (!element) return null;

  const isFavorite = isElementFavorite(element.z);
  const elementNotes = getNotesByElement(element.z);

  // Generate trend explanations
  const trendExplanations = generateTrendExplanations(element);

  // Helper function to get trend explanations
  const getTrendExplanation = (_element: Element, type: 'electronegativity' | 'atomic_radius' | 'ionization_energy' | 'general'): string => {
    switch (type) {
      case 'electronegativity':
        return trendExplanations.electronegativity_trend_tr;
      case 'atomic_radius':
        return trendExplanations.atomic_radius_trend_tr;
      case 'ionization_energy':
        return trendExplanations.ionization_energy_trend_tr;
      case 'general':
        return trendExplanations.general_info_tr;
      default:
        return '';
    }
  };

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
    setShowNoteForm(true);
  };

  const handleNoteSuccess = () => {
    // Show success notification
    const message = `${t('notes.create')} - ${getElementName(element)}`;
    // Using a simple alert for now, could be replaced with a toast notification
    alert(message);
    setShowNoteForm(false);
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
            ref={noteButtonRef}
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

          {/* Enhanced Trends Visualization */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Periyodik Trendler ve Açıklamalar</h3>
            <div className="space-y-4">
              
              {/* Electronegativity */}
              {element.electronegativity && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium w-32">Elektronegatiflik:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(element.electronegativity / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-12">{element.electronegativity}</span>
                  </div>
                  <div className="text-xs text-gray-700 mt-2">
                    {getTrendExplanation(element, 'electronegativity')}
                  </div>
                </div>
              )}

              {/* Atomic Radius */}
              {element.atomic_radius && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium w-32">Atom Yarıçapı:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((element.atomic_radius / 300) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-12">{element.atomic_radius} pm</span>
                  </div>
                  <div className="text-xs text-gray-700 mt-2">
                    {getTrendExplanation(element, 'atomic_radius')}
                  </div>
                </div>
              )}

              {/* Ionization Energy */}
              {element.ionization_energy && element.ionization_energy[0] && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium w-32">İyonlaşma Enerjisi:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((element.ionization_energy[0] / 25) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-12">{element.ionization_energy[0]} eV</span>
                  </div>
                  <div className="text-xs text-gray-700 mt-2">
                    {getTrendExplanation(element, 'ionization_energy')}
                  </div>
                </div>
              )}

              {/* General Element Information */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">🔬 Element Hakkında</h4>
                <div className="text-xs text-gray-700">
                  {getTrendExplanation(element, 'general')}
                </div>
              </div>

              {/* Periodic Position Context */}
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">📍 Periyodik Tablodaki Konumu</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Periyot:</strong> {element.period}</div>
                  <div><strong>Grup:</strong> {element.group || 'Belirsiz'}</div>
                  <div><strong>Blok:</strong> {element.block}-blok</div>
                  <div><strong>Kategori:</strong> {t(`category.${element.category}`)}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Academic Information Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📚 {t('element.academic-info')}</h3>
            <div className="space-y-4">
              
              {/* Usage Areas */}
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  🏭 {t('element.usage-areas')}
                </h4>
                <div className="text-xs text-gray-700">
                  {trendExplanations.usage_areas_tr}
                </div>
              </div>

              {/* Toxicity */}
              <div className="p-3 bg-red-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  ⚠️ {t('element.toxicity')}
                </h4>
                <div className="text-xs text-gray-700">
                  {trendExplanations.toxicity_tr}
                </div>
              </div>

              {/* Appearance */}
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  👁️ {t('element.appearance')}
                </h4>
                <div className="text-xs text-gray-700">
                  {trendExplanations.appearance_tr}
                </div>
              </div>

              {/* Radiation */}
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  ☢️ {t('element.radiation')}
                </h4>
                <div className="text-xs text-gray-700">
                  {trendExplanations.radiation_tr}
                </div>
              </div>

              {/* Isotopes */}
              <div className="p-3 bg-indigo-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  ⚛️ {t('element.isotopes')}
                </h4>
                <div className="text-xs text-gray-700">
                  {trendExplanations.isotopes_tr}
                </div>
              </div>

              {/* Natural Occurrence */}
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  🌍 {t('element.natural-occurrence')}
                </h4>
                <div className="text-xs text-gray-700">
                  {trendExplanations.natural_occurrence_tr}
                </div>
              </div>

              {/* Academic Notes */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  🎓 {t('element.academic-notes')}
                </h4>
                <div className="text-xs text-gray-700">
                  {trendExplanations.academic_notes_tr}
                </div>
              </div>

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

      {/* Compact Note Form */}
      <CompactNoteForm
        element={element}
        isVisible={showNoteForm}
        onClose={() => setShowNoteForm(false)}
        onSuccess={handleNoteSuccess}
      />
    </>
  );
};

export default ElementDetailPanel;