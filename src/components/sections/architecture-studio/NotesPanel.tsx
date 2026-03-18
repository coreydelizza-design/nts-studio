import React from 'react';
import type { ThemeTokens } from '../../../theme/tokens';
import type { WorkshopNote } from '../../../types';
import { Chip } from '../../shared/Primitives';

interface NotesPanelProps {
  t: ThemeTokens;
  notes: WorkshopNote[];
  removeNote: (id: number) => void;
  addNote: (type: WorkshopNote['type'], text: string) => void;
  newNote: string;
  setNewNote: (v: string) => void;
  newNoteType: WorkshopNote['type'];
  setNewNoteType: (v: WorkshopNote['type']) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({
  t, notes, removeNote, addNote, newNote, setNewNote, newNoteType, setNewNoteType,
}) => {
  const noteColors: Record<string, string> = { note: t.accent, assumption: t.amber, question: t.rose, decision: t.emerald };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {notes.map(n => (
          <div key={n.id} style={{ padding: '8px 10px', borderRadius: 7, background: (noteColors[n.type] || t.accent) + '06', border: `1px solid ${(noteColors[n.type] || t.accent)}15` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><Chip color={noteColors[n.type]} small>{n.type}</Chip><button onClick={() => removeNote(n.id)} style={{ background: 'none', border: 'none', color: t.textDim, fontSize: 11 }}>×</button></div>
            <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textSoft, lineHeight: 1.5 }}>{n.text}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 10, borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
          {(['note', 'assumption', 'question', 'decision'] as const).map(typ => (<button key={typ} onClick={() => setNewNoteType(typ)} style={{ padding: '2px 7px', borderRadius: 3, border: `1px solid ${newNoteType === typ ? noteColors[typ] + '40' : 'transparent'}`, background: newNoteType === typ ? noteColors[typ] + '15' : 'transparent', color: newNoteType === typ ? noteColors[typ] : t.textDim, fontFamily: t.fontM, fontSize: 8 }}>{typ}</button>))}
        </div>
        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Capture a note..." rows={2} style={{ width: '100%', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 5, color: t.text, fontFamily: t.fontB, fontSize: 11, padding: '7px 9px', resize: 'none', marginBottom: 5 }} />
        <button onClick={() => { if (newNote.trim()) { addNote(newNoteType, newNote.trim()); setNewNote(''); } }} style={{ width: '100%', padding: 7, borderRadius: 5, border: 'none', background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`, color: '#fff', fontFamily: t.fontD, fontSize: 11, fontWeight: 600 }}>Add Note</button>
      </div>
    </div>
  );
};

export default NotesPanel;
