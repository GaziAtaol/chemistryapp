// Periodic Table Component

import React from 'react';
import type { Element } from '../../types';
import { useElements, useFavorites } from '../../hooks';
import { t, getElementName } from '../../utils/i18n';
import { playElementHoverSound, playElementClickSound } from '../../utils/audio';

interface ElementCellProps {
  element: Element;
  onClick: (element: Element) => void;
  isSelected?: boolean;
}

const ElementCell: React.FC<ElementCellProps> = ({ element, onClick, isSelected }) => {
  const { isElementFavorite } = useFavorites();
  
  const isFavorite = isElementFavorite(element.z);

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

  const handleElementClick = (element: Element) => {
    playElementClickSound();
    onClick(element);
  };

  const handleElementHover = () => {
    playElementHoverSound();
  };

  return (
    <div
      className={`element-cell element-${element.category} ${isSelected ? 'selected' : ''} relative group`}
      onClick={() => handleElementClick(element)}
      onMouseEnter={handleElementHover}
      tabIndex={0}
      role="button"
      aria-label={`${getElementName(element)}, ${t('element.atomic-number')} ${element.z}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleElementClick(element);
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
      </div>
    </div>
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

          {/* Separated Filters */}
          <div className="space-y-4">
            {/* Category Filter Row */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  {t('pt.filter.category')}
                </label>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearCategoryFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 rounded-full transition-all"
                  >
                    {t('pt.filter.clear')} ({selectedCategories.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <label key={cat.value} className="flex items-center space-x-1 text-xs cursor-pointer hover:bg-white px-2 py-1 rounded-md transition-colors border border-gray-200 bg-white">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.value)}
                      onChange={() => toggleCategory(cat.value)}
                      className="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className={`w-2 h-2 rounded-full element-${cat.value}`}></span>
                    <span className="font-medium">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Block Filter Row */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  {t('pt.filter.block')}
                </label>
                {selectedBlocks.length > 0 && (
                  <button
                    onClick={clearBlockFilters}
                    className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 bg-green-50 rounded-full transition-all"
                  >
                    {t('pt.filter.clear')} ({selectedBlocks.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {blocks.map(block => (
                  <label key={block.value} className="flex items-center space-x-1 text-xs cursor-pointer hover:bg-white px-2 py-1 rounded-md transition-colors border border-gray-200 bg-white">
                    <input
                      type="checkbox"
                      checked={selectedBlocks.includes(block.value)}
                      onChange={() => toggleBlock(block.value)}
                      className="w-3 h-3 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span className="font-medium">{block.label}</span>
                  </label>
                ))}
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