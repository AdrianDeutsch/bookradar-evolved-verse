
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { storage } from '@/utils/localStorage';
import { BookOpenText, Plus, Trash2, Edit, Save, Calendar } from 'lucide-react';

interface Note {
  id: string;
  bookId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  page?: number;
}

interface ReadingNotesProps {
  bookId: string;
}

const ReadingNotes = ({ bookId }: ReadingNotesProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadNotes();
  }, [bookId]);

  const loadNotes = () => {
    const savedNotes = storage.get<Note[]>(`bookradar-notes-${bookId}`, []);
    setNotes(savedNotes);
  };

  const saveNotes = (updatedNotes: Note[]) => {
    storage.set(`bookradar-notes-${bookId}`, updatedNotes);
    setNotes(updatedNotes);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const now = new Date().toISOString();
    const note: Note = {
      id: `note-${Date.now()}`,
      bookId,
      text: newNote,
      createdAt: now,
      updatedAt: now
    };

    const updatedNotes = [...notes, note];
    saveNotes(updatedNotes);
    setNewNote('');
    
    toast({
      title: language === 'de' ? 'Notiz hinzugefügt' : 'Note added',
      description: language === 'de' ? 'Deine Notiz wurde gespeichert' : 'Your note has been saved',
    });
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    
    toast({
      title: language === 'de' ? 'Notiz gelöscht' : 'Note deleted',
      description: language === 'de' ? 'Notiz wurde entfernt' : 'Note has been removed',
    });
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const saveEdit = () => {
    if (!editingNoteId) return;

    const updatedNotes = notes.map(note => {
      if (note.id === editingNoteId) {
        return {
          ...note,
          text: editText,
          updatedAt: new Date().toISOString()
        };
      }
      return note;
    });

    saveNotes(updatedNotes);
    setEditingNoteId(null);
    setEditText('');
    
    toast({
      title: language === 'de' ? 'Notiz aktualisiert' : 'Note updated',
      description: language === 'de' ? 'Deine Änderungen wurden gespeichert' : 'Your changes have been saved',
    });
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditText('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenText className="h-5 w-5" />
          {language === 'de' ? 'Lesenotizen' : 'Reading Notes'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder={language === 'de' ? 'Neue Notiz hinzufügen...' : 'Add a new note...'}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px]"
          />
          
          <Button 
            onClick={handleAddNote} 
            disabled={!newNote.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'de' ? 'Notiz hinzufügen' : 'Add Note'}
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">
              {language === 'de' 
                ? 'Keine Notizen vorhanden. Füge deine erste Notiz hinzu!' 
                : 'No notes yet. Add your first note!'}
            </p>
          ) : (
            notes.map(note => (
              <div 
                key={note.id} 
                className="border rounded-md p-4 space-y-2 bg-card"
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEdit}
                      >
                        {language === 'de' ? 'Abbrechen' : 'Cancel'}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        onClick={saveEdit}
                        disabled={!editText.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {language === 'de' ? 'Speichern' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm">{note.text}</p>
                    
                    <div className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {formatDate(note.updatedAt !== note.createdAt ? note.updatedAt : note.createdAt)}
                          {note.updatedAt !== note.createdAt && (
                            <em className="ml-1">
                              ({language === 'de' ? 'bearbeitet' : 'edited'})
                            </em>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => startEditing(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive" 
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingNotes;
