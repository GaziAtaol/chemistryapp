// Tooltip Component for displaying element notes

import React, { useState, useEffect } from 'react';

interface TooltipProps {
  content: string;
  title?: string;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose?: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({ content, title, isVisible, position, onClose }) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!isVisible) return;

    // Adjust position to stay within viewport
    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const padding = 10;

    let { x, y } = position;

    // Adjust horizontal position
    if (x + tooltipWidth > window.innerWidth - padding) {
      x = window.innerWidth - tooltipWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position
    if (y + tooltipHeight > window.innerHeight - padding) {
      y = y - tooltipHeight - 20; // Show above the element
    } else {
      y = y + 20; // Show below the element
    }

    setAdjustedPosition({ x, y });
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop for closing */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-w-xs"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          transform: 'translateZ(0)', // Force hardware acceleration
        }}
      >
        {/* Arrow pointing to element */}
        <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
        
        {/* Content */}
        <div className="p-3">
          {title && (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-brand flex items-center gap-1">
                📝 {title}
              </h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                  aria-label="Kapat"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <div className="text-sm text-gray-700 leading-relaxed max-h-20 overflow-y-auto">
            {content}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tooltip;