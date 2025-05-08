
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { searchBooks, SearchResult } from '@/services/bookService';

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
  const { books, addBook } = useLocalLibrary();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedBookId, setSelectedBookId] = useState<string | null>(currentBookId);
  const [updatingBook, setUpdatingBook] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchBooks({ query: searchQuery, limit: 5 });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching books:", error);
      toast({
        title: language === 'de' ? 'Fehler bei der Suche' : 'Search Error',
        description: language === 'de' 
          ? 'Bücher konnten nicht geladen werden'
          : 'Failed to load books',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddBook = (book: SearchResult) => {
    addBook({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl || '',
      rating: book.rating
    });
    
    setSelectedBookId(book.id);
    handleBookChange(book.id);
    
    toast({
      title: language === 'de' ? 'Buch hinzugefügt' : 'Book added',
      description: language === 'de'
        ? 'Buch wurde zu deiner Bibliothek hinzugefügt'
        : 'Book has been added to your library'
    });
    
    // Reset search
    setSearchQuery("");
    setSearchResults([]);
  };
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="space-y-5 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
      <h3 className="text-lg font-medium">
        {language === 'de' ? 'Aktuelles Buch festlegen' : 'Set Current Book'}
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'de' ? 'Aus Bibliothek wählen' : 'Select from Library'}
          </label>
          
          {books.length > 0 ? (
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
          ) : (
            <div className="text-sm text-muted-foreground">
              {language === 'de'
                ? 'Keine Bücher in deiner Bibliothek'
                : 'No books in your library'}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'de' ? 'Neues Buch suchen' : 'Search for a new book'}
          </label>
          
          <div className="flex mt-2 gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'de' ? "Buchtitel oder Autor" : "Book title or author"}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              type="button"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'de' ? 'Suchergebnisse' : 'Search Results'}
              </h4>
              <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                {searchResults.map((book) => (
                  <div 
                    key={book.id} 
                    className="flex items-center gap-3 p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-10 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Book className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddBook(book)}
                      className="whitespace-nowrap"
                    >
                      {language === 'de' ? 'Hinzufügen' : 'Add'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {updatingBook && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {language === 'de' ? 'Wird aktualisiert...' : 'Updating...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookClubBookSelector;
