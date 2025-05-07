
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface BookClubBookSelectorProps {
  clubId: string;
  currentBookId: string | null;
  isAdmin: boolean;
  onBookChange: (bookId: string) => Promise<void>;
}

const BookClubBookSelector = ({ 
  clubId, 
  currentBookId, 
  isAdmin, 
  onBookChange 
}: BookClubBookSelectorProps) => {
  const { language } = useLanguage();
  const { books } = useLocalLibrary();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedBookId, setSelectedBookId] = useState<string | null>(currentBookId);
  const [updatingBook, setUpdatingBook] = useState(false);
  
  const handleBookChange = async (bookId: string) => {
    setSelectedBookId(bookId);
    setUpdatingBook(true);
    
    try {
      await onBookChange(bookId);
      
      toast({
        title: language === 'de' ? 'Buch aktualisiert' : 'Book updated',
        description: language === 'de'
          ? 'Das aktuelle Buch wurde aktualisiert'
          : 'The current book has been updated'
      });
    } catch (err) {
      console.error('Error updating book:', err);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Das Buch konnte nicht aktualisiert werden'
          : 'Could not update the book',
        variant: "destructive"
      });
    } finally {
      setUpdatingBook(false);
    }
  };
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">
        {language === 'de' ? 'Aktuelles Buch festlegen' : 'Set Current Book'}
      </h3>
      {books.length > 0 ? (
        <div className="space-y-2">
          <Select
            value={selectedBookId || ""}
            onValueChange={handleBookChange}
            disabled={updatingBook}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                language === 'de' 
                  ? "Wähle ein Buch für die Gruppe" 
                  : "Select a book for the club"
              } />
            </SelectTrigger>
            <SelectContent>
              {books.map(book => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title} - {book.author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {updatingBook && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === 'de' ? 'Wird aktualisiert...' : 'Updating...'}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {language === 'de'
            ? 'Füge zuerst Bücher zu deiner Bibliothek hinzu'
            : 'Add books to your library first'}
          <button
            className="ml-1 text-primary hover:underline"
            onClick={() => navigate('/library')}
          >
            {language === 'de' ? 'Zur Bibliothek' : 'Go to Library'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookClubBookSelector;
