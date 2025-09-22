// Compact Note Form Component - Tooltip style for quick note creation

import React, { useState } from 'react';
import type { Element } from '../../types';
import { useNotes } from '../../hooks';
import { getElementName } from '../../utils/i18n';

interface CompactNoteFormProps {
  element: Element;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSuccess: () => void;
}

const CompactNoteForm: React.FC<CompactNoteFormProps> = ({ 
  element, 
  isVisible, 
  position,
  onClose, 
  onSuccess 
}) => {
  const { createNote } = useNotes();
  const [noteData, setNoteData] = useState({
    title: `${getElementName(element)} Notu`,
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteData.content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await createNote({
        title: noteData.title || `${getElementName(element)} Notu`,
        content: noteData.content,
        element_id: element.z,
        tags: [`element`, element.symbol.toLowerCase()]
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setNoteData({
        title: `${getElementName(element)} Notu`,
        content: ''
      });
    } catch (error) {
      console.error('Note creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustedPosition = React.useMemo(() => {
    if (!isVisible) return position;
    
    const formWidth = 320;
    const formHeight = 180;
    const padding = 10;

    let { x, y } = position;

    // Adjust horizontal position
    if (x + formWidth > window.innerWidth - padding) {
      x = window.innerWidth - formWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position
    if (y + formHeight > window.innerHeight - padding) {
      y = y - formHeight - 20; // Show above the element
    } else {
      y = y + 20; // Show below the element
    }

    return { x, y };
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Compact Note Form */}
      <div
        className="fixed z-50 bg-white border border-brand/30 rounded-lg shadow-xl"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          width: '320px',
        }}
      >
        {/* Arrow */}
        <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-brand/30 transform rotate-45"></div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-brand flex items-center gap-1">
              📝 {getElementName(element)} için Not
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Formu kapat"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Not başlığı..."
                value={noteData.title}
                onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <textarea
                placeholder="Notunuzu buraya yazın..."
                value={noteData.content}
                onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                rows={3}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={!noteData.content.trim() || isSubmitting}
                className="flex-1 px-3 py-1 text-xs font-medium text-white bg-brand rounded hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CompactNoteForm;