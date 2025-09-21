import React, { useState } from 'react';
import type { Note } from '../../types';
import { useNotes, useAppData } from '../../hooks';
import { t, getElementName } from '../../utils/i18n';

const Notes: React.FC = () => {
  const { 
    notes, 
    filteredNotes, 
    searchQuery, 
    setSearchQuery, 
    createNote, 
    updateNote, 
    deleteNote 
  } = useNotes();
  
  const { data } = useAppData();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    const tagsArray = newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    createNote({
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      tags: tagsArray
    });
    
    setNewNote({ title: '', content: '', tags: '' });
    setIsCreating(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote({ ...note });
  };

  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.title.trim() || !editingNote.content.trim()) return;
    
    updateNote(editingNote.id, {
      title: editingNote.title.trim(),
      content: editingNote.content.trim(),
      tags: editingNote.tags
    });
    
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm(t('common.confirm-delete'))) {
      deleteNote(noteId);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getElementForNote = (elementId?: number) => {
    if (!elementId) return null;
    return data.elements.find(el => el.z === elementId);
  };

  return (
    <div className="space-y-6">
      {/* Search and Create Header */}
      <div className="quiz-question-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder={t('notes.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full"
            />
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary w-full sm:w-auto"
          >
            📝 {t('notes.create')}
          </button>
        </div>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <div className="quiz-question-card">
          <h3 className="text-lg font-semibold mb-4 text-brand">{t('notes.create')}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('notes.title-placeholder')}
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="input w-full"
            />
            <textarea
              placeholder={t('notes.content-placeholder')}
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={4}
              className="input w-full"
            />
            <input
              type="text"
              placeholder="Etiketler (virgülle ayrılmış)..."
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              className="input w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateNote}
                className="btn btn-primary"
                disabled={!newNote.title.trim() || !newNote.content.trim()}
              >
                {t('notes.save')}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', tags: '' });
                }}
                className="btn"
              >
                {t('notes.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Form */}
      {editingNote && (
        <div className="quiz-question-card">
          <h3 className="text-lg font-semibold mb-4 text-brand">{t('notes.edit')}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('notes.title-placeholder')}
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              className="input w-full"
            />
            <textarea
              placeholder={t('notes.content-placeholder')}
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              rows={4}
              className="input w-full"
            />
            <input
              type="text"
              placeholder="Etiketler (virgülle ayrılmış)..."
              value={editingNote.tags.join(', ')}
              onChange={(e) => setEditingNote({ 
                ...editingNote, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              className="input w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdateNote}
                className="btn btn-primary"
                disabled={!editingNote.title.trim() || !editingNote.content.trim()}
              >
                {t('notes.save')}
              </button>
              <button
                onClick={() => setEditingNote(null)}
                className="btn"
              >
                {t('notes.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="quiz-question-card text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600 text-lg">{t('notes.empty')}</p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary mt-4"
          >
            {t('notes.create')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const relatedElement = getElementForNote(note.element_id);
            
            return (
              <div key={note.id} className="quiz-question-card">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-brand mb-1">
                      {note.title}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {formatDate(note.created_at)}
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <span> • Güncellendi: {formatDate(note.updated_at)}</span>
                      )}
                      {relatedElement && (
                        <span className="ml-2">
                          • Element: <span className="font-medium">{getElementName(relatedElement)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="btn btn-sm"
                      title={t('notes.edit')}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="btn btn-sm text-red-600 hover:bg-red-50"
                      title={t('notes.delete')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="text-gray-800 mb-3 whitespace-pre-wrap">
                  {note.content}
                </div>
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-accent/20 text-accent px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="quiz-question-card bg-brand/5">
        <div className="text-center">
          <div className="text-2xl font-bold text-brand">{notes.length}</div>
          <div className="text-sm text-gray-600">Toplam Not</div>
        </div>
      </div>
    </div>
  );
};

export default Notes;