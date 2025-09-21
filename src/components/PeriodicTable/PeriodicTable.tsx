// Periodic Table Component

import React from 'react';
import type { Element } from '../../types';
import { useElements, useFavorites } from '../../hooks';
import { t, getElementName } from '../../utils/i18n';

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

  return (
    <div
      className={`element-cell element-${element.category} ${isSelected ? 'selected' : ''}`}
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
      {isFavorite && <div className="absolute top-1 right-1 text-yellow-400">⭐</div>}
    </div>
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
        <div className="flex flex-wrap gap-4 text-sm">
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