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
  position: _position,
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

  // Center the form on screen instead of positioning relative to element
  const centerPosition = React.useMemo(() => {
    const formWidth = 400; // Slightly wider for better UX
    const formHeight = 280; // Slightly taller for better spacing
    
    return {
      x: (window.innerWidth - formWidth) / 2,
      y: (window.innerHeight - formHeight) / 2
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop with better darkening */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Centered Modal-style Note Form */}
      <div
        className="fixed z-50 bg-white border border-brand/20 rounded-xl shadow-2xl"
        style={{
          left: centerPosition.x,
          top: centerPosition.y,
          width: '400px',
          minHeight: '280px',
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        {/* Header with better styling */}
        <div className="bg-gradient-to-r from-brand/5 to-brand/10 px-6 py-4 border-b border-brand/10 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-brand flex items-center gap-2">
              📝 {getElementName(element)} için Not
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              aria-label="Formu kapat"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Form with improved styling */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Not Başlığı
              </label>
              <input
                type="text"
                placeholder="Not başlığı..."
                value={noteData.title}
                onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-colors"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Not İçeriği
              </label>
              <textarea
                placeholder="Notunuzu buraya yazın..."
                value={noteData.content}
                onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-colors"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!noteData.content.trim() || isSubmitting}
                className="flex-1 px-4 py-2 text-white bg-brand rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? '⏳ Kaydediliyor...' : '💾 Notu Kaydet'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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