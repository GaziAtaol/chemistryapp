// Inline Note Creation Form Component for Element Detail Panel

import React, { useState } from 'react';
import type { Element } from '../../types';
import { useNotes } from '../../hooks';
import { t, getElementName } from '../../utils/i18n';

interface InlineNoteFormProps {
  element: Element;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const InlineNoteForm: React.FC<InlineNoteFormProps> = ({ 
  element, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { createNote } = useNotes();
  const [noteData, setNoteData] = useState({
    title: `${getElementName(element)} ${t('notes.title')}`,
    content: `${t('element.atomic-number')}: ${element.z}\n${t('element.electron-config')}: ${element.electron_config}`,
    tags: `element,${element.symbol.toLowerCase()}`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!noteData.title.trim() || !noteData.content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const tagsArray = noteData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      createNote({
        title: noteData.title.trim(),
        content: noteData.content.trim(),
        element_id: element.z,
        tags: tagsArray
      });
      
      // Show success notification
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close
      setNoteData({
        title: `${getElementName(element)} ${t('notes.title')}`,
        content: `${t('element.atomic-number')}: ${element.z}\n${t('element.electron-config')}: ${element.electron_config}`,
        tags: `element,${element.symbol.toLowerCase()}`
      });
      onClose();
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setNoteData({
      title: `${getElementName(element)} ${t('notes.title')}`,
      content: `${t('element.atomic-number')}: ${element.z}\n${t('element.electron-config')}: ${element.electron_config}`,
      tags: `element,${element.symbol.toLowerCase()}`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="quiz-question-card mt-4 border-l-4 border-l-brand bg-brand/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-brand flex items-center gap-2">
          📝 {getElementName(element)} için Not Oluştur
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Formu kapat"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Not Başlığı
          </label>
          <input
            type="text"
            placeholder={t('notes.title-placeholder')}
            value={noteData.title}
            onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
            className="input w-full"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Not İçeriği
          </label>
          <textarea
            placeholder={t('notes.content-placeholder')}
            value={noteData.content}
            onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
            rows={4}
            className="input w-full resize-none"
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etiketler
          </label>
          <input
            type="text"
            placeholder="Etiketler (virgülle ayrılmış)..."
            value={noteData.tags}
            onChange={(e) => setNoteData({ ...noteData, tags: e.target.value })}
            className="input w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Element otomatik olarak etiketlendi: {element.symbol.toLowerCase()}, element
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!noteData.title.trim() || !noteData.content.trim() || isSubmitting}
            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '⏳ Kaydediliyor...' : '💾 Notu Kaydet'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="btn flex-1"
          >
            ❌ İptal
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineNoteForm;