// Periodic Table Component

import React, { useState } from 'react';
import type { Element } from '../../types';
import { useElements, useFavorites, useNotes } from '../../hooks';
import { t, getElementName } from '../../utils/i18n';
import Tooltip from './Tooltip';
import CompactNoteForm from './CompactNoteForm';

interface ElementCellProps {
  element: Element;
  onClick: (element: Element) => void;
  isSelected?: boolean;
}

const ElementCell: React.FC<ElementCellProps> = ({ element, onClick, isSelected }) => {
  const { isElementFavorite } = useFavorites();
  const { getNotesByElement } = useNotes();
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const isFavorite = isElementFavorite(element.z);
  const elementNotes = getNotesByElement(element.z);
  const hasNotes = elementNotes.length > 0;

  // Calculate grid position for proper periodic table layout
  const getGridPosition = () => {
    const row = element.period;
    const col = element.group || 1;
    
    // Handle lanthanides and actinides positioning
    if (element.category === 'lanthanide') {
      return {
        gridRow: 9, // Place lanthanides in row 9
        gridColumn: element.z - 54 + 3 // Starting from column 3
      };
    }
    
    if (element.category === 'actinide') {
      return {
        gridRow: 10, // Place actinides in row 10
        gridColumn: element.z - 86 + 3 // Starting from column 3
      };
    }
    
    return {
      gridRow: row,
      gridColumn: col
    };
  };

  const handleNoteIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom
    });
    setShowNoteTooltip(true);
  };

  const handleNoteIconHover = (e: React.MouseEvent) => {
    if (!hasNotes) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom
    });
    setShowNoteTooltip(true);
  };

  const handleNoteSuccess = () => {
    // Note was created successfully, we can show a brief success indication
    setShowNoteForm(false);
  };

  const gridPosition = getGridPosition();

  const getMostRecentNote = () => {
    if (elementNotes.length === 0) return null;
    return elementNotes.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
  };

  const recentNote = getMostRecentNote();

  return (
    <>
      <div
        className={`element-cell element-${element.category} ${isSelected ? 'selected' : ''} relative group`}
        onClick={() => onClick(element)}
        tabIndex={0}
        role="button"
        aria-label={`${getElementName(element)}, ${t('element.atomic-number')} ${element.z}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(element);
          }
        }}
        style={{
          gridRow: gridPosition.gridRow,
          gridColumn: gridPosition.gridColumn
        }}
      >
        <div className="element-number">{element.z}</div>
        <div className="element-symbol">{element.symbol}</div>
        <div className="element-name">{getElementName(element).slice(0, 8)}</div>
        
        {/* Icons overlay */}
        <div className="absolute top-1 right-1 flex flex-col gap-1">
          {isFavorite && <div className="text-yellow-400 text-xs">⭐</div>}
          {hasNotes && (
            <div 
              className="text-blue-500 text-xs cursor-pointer hover:text-blue-600 hover:scale-110 transition-all duration-200" 
              onClick={handleNoteIconClick}
              onMouseEnter={handleNoteIconHover}
              onMouseLeave={() => setShowNoteTooltip(false)}
              title={`${elementNotes.length} not var`}
            >
              📝
            </div>
          )}
        </div>

        {/* Quick note button on hover (when no notes exist) */}
        {!hasNotes && (
          <div 
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom
              });
              setShowNoteForm(true);
            }}
          >
            <div className="text-gray-400 hover:text-brand text-xs cursor-pointer hover:scale-110 transition-all duration-200" title="Not ekle">
              📝
            </div>
          </div>
        )}
      </div>

      {/* Note Tooltip */}
      {showNoteTooltip && hasNotes && recentNote && (
        <Tooltip
          isVisible={showNoteTooltip}
          position={tooltipPosition}
          title={recentNote.title}
          content={recentNote.content}
          onClose={() => setShowNoteTooltip(false)}
        />
      )}

      {/* Compact Note Form */}
      <CompactNoteForm
        element={element}
        isVisible={showNoteForm}
        position={tooltipPosition}
        onClose={() => setShowNoteForm(false)}
        onSuccess={handleNoteSuccess}
      />
    </>
  );
};

interface PeriodicTableProps {
  onElementSelect: (element: Element) => void;
  selectedElement?: Element;
}

const PeriodicTable: React.FC<PeriodicTableProps> = ({ onElementSelect, selectedElement }) => {
  const { filteredElements, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, selectedBlock, setSelectedBlock } = useElements();

  const categories = [
    { value: 'all', label: t('pt.filter.all') },
    { value: 'alkali-metal', label: t('category.alkali-metal') },
    { value: 'alkaline-earth-metal', label: t('category.alkaline-earth-metal') },
    { value: 'transition-metal', label: t('category.transition-metal') },
    { value: 'post-transition-metal', label: t('category.post-transition-metal') },
    { value: 'metalloid', label: t('category.metalloid') },
    { value: 'nonmetal', label: t('category.nonmetal') },
    { value: 'halogen', label: t('category.halogen') },
    { value: 'noble-gas', label: t('category.noble-gas') },
    { value: 'lanthanide', label: t('category.lanthanide') },
    { value: 'actinide', label: t('category.actinide') }
  ];

  const blocks = [
    { value: 'all', label: t('pt.filter.all') },
    { value: 's', label: t('pt.block.s') },
    { value: 'p', label: t('pt.block.p') },
    { value: 'd', label: t('pt.block.d') },
    { value: 'f', label: t('pt.block.f') }
  ];

  return (
    <div className="periodic-table-container">
      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('pt.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="input"
            >
              {blocks.map(block => (
                <option key={block.value} value={block.value}>{block.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Periodic Table Grid */}
      <div className="periodic-table">
        {filteredElements.map(element => (
          <ElementCell
            key={element.z}
            element={element}
            onClick={onElementSelect}
            isSelected={selectedElement?.z === element.z}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">{t('element.properties')}</h3>
        <div className="flex gap-4 text-sm overflow-x-auto">
          {categories.slice(1).map(cat => (
            <div key={cat.value} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded element-${cat.value}`}></div>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeriodicTable;