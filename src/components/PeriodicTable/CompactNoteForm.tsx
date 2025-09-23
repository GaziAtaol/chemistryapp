// Compact Note Form Component - Tooltip style for quick note creation

import React, { useState } from 'react';
import type { Element } from '../../types';
import { useNotes } from '../../hooks';
import { getElementName } from '../../utils/i18n';

interface CompactNoteFormProps {
  element: Element;
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CompactNoteForm: React.FC<CompactNoteFormProps> = ({ 
  element, 
  isVisible, 
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

  // Center the form on screen with responsive sizing
  const centerPosition = React.useMemo(() => {
    const isMobile = window.innerWidth <= 640;
    const formWidth = isMobile ? window.innerWidth - 20 : Math.min(450, window.innerWidth - 40);
    const formHeight = Math.min(350, window.innerHeight - 40);
    
    return {
      x: isMobile ? 10 : (window.innerWidth - formWidth) / 2,
      y: isMobile ? (window.innerHeight - formHeight) / 2 : (window.innerHeight - formHeight) / 2,
      width: formWidth,
      height: formHeight,
      isMobile
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Enhanced Backdrop with better darkening */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      />
      
      {/* Enhanced Centered Modal-style Note Form */}
      <div
        className={`fixed z-50 bg-white border border-brand/30 rounded-2xl shadow-2xl overflow-hidden ${centerPosition.isMobile ? 'modal-responsive' : ''}`}
        style={{
          left: centerPosition.x,
          top: centerPosition.y,
          width: `${centerPosition.width}px`,
          minHeight: `${centerPosition.height}px`,
          animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Enhanced Header with better gradient and typography */}
        <div className="bg-gradient-to-r from-brand/8 to-brand/12 px-6 py-5 border-b border-brand/15">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-brand flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <span>{getElementName(element)} için Not</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full hover:scale-110"
              aria-label="Formu kapat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Enhanced Form with improved spacing and styling */}
        <form onSubmit={handleSubmit} className="p-7">
          <div className="space-y-6">
            {/* Title Input with enhanced styling */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📋 Not Başlığı
              </label>
              <input
                type="text"
                placeholder="Not başlığınızı yazın..."
                value={noteData.title}
                onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-brand/30 focus:border-brand/60 transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Content Textarea with enhanced styling */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                ✏️ Not İçeriği
              </label>
              <textarea
                placeholder="Notunuzu buraya yazın... (Element hakkında önemli bilgiler, ipuçları, ya da hatırlatmalar)"
                value={noteData.content}
                onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-3 focus:ring-brand/30 focus:border-brand/60 transition-all duration-200 text-gray-700 placeholder-gray-400"
                required
              />
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={!noteData.content.trim() || isSubmitting}
                className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-brand to-brand/90 rounded-xl hover:from-brand/90 hover:to-brand/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Notu Kaydet
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold hover:scale-[1.02] transform"
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