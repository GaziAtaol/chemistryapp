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

  const gridPosition = getGridPosition();

  const handleNoteIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom
    });
    if (hasNotes) {
      setShowNoteTooltip(true);
    } else {
      setShowNoteForm(true);
    }
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
    setShowNoteForm(false);
    // Force component re-render to show the note indicator
    // The useNotes hook should already handle the state update
  };

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
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!hasNotes) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({
              x: rect.left + rect.width / 2,
              y: rect.bottom
            });
            setShowNoteForm(true);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom
          });
          setShowNoteForm(true);
        }}
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
              className="cursor-pointer hover:scale-125 transition-all duration-200" 
              onClick={handleNoteIconClick}
              onMouseEnter={handleNoteIconHover}
              onMouseLeave={() => setShowNoteTooltip(false)}
              title={`${elementNotes.length} not var`}
            >
              {/* Sparkling dot indicator */}
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse shadow-sm relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          )}
        </div>
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
  const { 
    filteredElements, 
    searchQuery, 
    setSearchQuery, 
    selectedCategories, 
    selectedBlocks, 
    toggleCategory, 
    toggleBlock, 
    clearCategoryFilters, 
    clearBlockFilters 
  } = useElements();

  const categories = [
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
    { value: 's', label: t('pt.block.s') },
    { value: 'p', label: t('pt.block.p') },
    { value: 'd', label: t('pt.block.d') },
    { value: 'f', label: t('pt.block.f') }
  ];

  return (
    <div className="periodic-table-container">
      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('pt.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Multi-select Filters */}
          <div className="flex flex-row gap-6">
            {/* Category Filter */}
            <div className="flex-1 min-w-0">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {t('pt.filter.category')}
                  </label>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={clearCategoryFilters}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                      {t('pt.filter.clear')} ({selectedCategories.length})
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto bg-white rounded-lg p-3 border border-blue-100 shadow-inner">
                  {categories.map(cat => (
                    <label key={cat.value} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-blue-50 p-2 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className={`w-3 h-3 rounded-full element-${cat.value} shadow-sm`}></span>
                      <span className="truncate font-medium">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Block Filter */}
            <div className="flex-shrink-0 w-72">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t('pt.filter.block')}
                  </label>
                  {selectedBlocks.length > 0 && (
                    <button
                      onClick={clearBlockFilters}
                      className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                      {t('pt.filter.clear')} ({selectedBlocks.length})
                    </button>
                  )}
                </div>
                <div className="space-y-2 bg-white rounded-lg p-3 border border-green-100 shadow-inner">
                  {blocks.map(block => (
                    <label key={block.value} className="flex items-center space-x-3 text-sm cursor-pointer hover:bg-green-50 p-2 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBlocks.includes(block.value)}
                        onChange={() => toggleBlock(block.value)}
                        className="w-3.5 h-3.5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="font-medium">{block.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategories.length > 0 || selectedBlocks.length > 0) && (
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">{t('pt.filter.active')}:</span>
            {selectedCategories.map(cat => {
              const category = categories.find(c => c.value === cat);
              return (
                <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <span className={`w-2 h-2 rounded element-${cat}`}></span>
                  {category?.label}
                  <button onClick={() => toggleCategory(cat)} className="hover:text-blue-600">×</button>
                </span>
              );
            })}
            {selectedBlocks.map(block => {
              const blockData = blocks.find(b => b.value === block);
              return (
                <span key={block} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {blockData?.label}
                  <button onClick={() => toggleBlock(block)} className="hover:text-green-600">×</button>
                </span>
              );
            })}
          </div>
        )}
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
          {categories.map(cat => (
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