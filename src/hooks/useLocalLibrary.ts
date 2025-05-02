
import { useState, useEffect } from 'react';
import { storage } from '@/utils/localStorage';

// Define types for our library items
export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating?: number;
  lastOpened?: Date;
  progress?: number;
  shelf?: 'reading' | 'want-to-read' | 'completed';
  totalPages?: number; // Neu hinzugefügt für die Seitenanzahl
}

export function useLocalLibrary(searchTerm: string = '', activeTab: string = 'all') {
  // Sample library data - in a production app this would come from Supabase
  const [books, setBooks] = useState<LibraryBook[]>(() => {
    const savedBooks = storage.get<LibraryBook[]>('bookradar_library', []);
    
    // If no saved books, use sample data
    if (savedBooks.length === 0) {
      return [
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          coverUrl: 'https://covers.openlibrary.org/b/id/8152547-M.jpg',
          rating: 4.2,
          progress: 72,
          shelf: 'reading',
          totalPages: 180
        },
        {
          id: '2',
          title: '1984',
          author: 'George Orwell',
          coverUrl: 'https://covers.openlibrary.org/b/id/8575241-M.jpg',
          rating: 4.6,
          progress: 15,
          shelf: 'reading',
          totalPages: 328
        },
        {
          id: '3',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          coverUrl: 'https://covers.openlibrary.org/b/id/12008442-M.jpg',
          rating: 4.8,
          progress: 100,
          shelf: 'completed',
          totalPages: 281
        },
        {
          id: '4',
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          coverUrl: 'https://covers.openlibrary.org/b/id/6498519-M.jpg',
          rating: 4.5,
          shelf: 'want-to-read',
          totalPages: 279
        },
        {
          id: '5',
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          coverUrl: 'https://covers.openlibrary.org/b/id/6979861-M.jpg',
          rating: 4.7,
          shelf: 'want-to-read',
          totalPages: 310
        }
      ];
    }
    
    return savedBooks;
  });

  const [filteredBooks, setFilteredBooks] = useState<LibraryBook[]>(books);

  // Save books to localStorage whenever they change
  useEffect(() => {
    storage.set('bookradar_library', books);
  }, [books]);

  // Filter books based on search term and active tab
  useEffect(() => {
    let results = books;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (activeTab === 'reading') {
      results = results.filter(book => book.shelf === 'reading');
    } else if (activeTab === 'want-to-read') {
      results = results.filter(book => book.shelf === 'want-to-read');
    } else if (activeTab === 'completed') {
      results = results.filter(book => book.progress === 100 || book.shelf === 'completed');
    }
    
    setFilteredBooks(results);
  }, [searchTerm, books, activeTab]);

  // Function to add a book to a specific shelf
  const addToShelf = (bookId: string, shelf: 'reading' | 'want-to-read' | 'completed') => {
    setBooks(prevBooks => 
      prevBooks.map(book => {
        if (book.id === bookId) {
          const updatedBook = { ...book, shelf };
          
          // Set initial progress for reading books if not already set
          if (shelf === 'reading' && book.progress === undefined) {
            updatedBook.progress = 0;
          }
          
          // Set completed books to 100% progress
          if (shelf === 'completed' && (book.progress === undefined || book.progress < 100)) {
            updatedBook.progress = 100;
          }
          
          return updatedBook;
        }
        return book;
      })
    );
  };

  // Function to remove a book from all shelves
  const removeFromShelf = (bookId: string) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { 
              ...book, 
              shelf: undefined,
              progress: undefined
            } 
          : book
      )
    );
  };

  // Function to update a book's reading progress
  const updateProgress = (bookId: string, progress: number) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { 
              ...book, 
              progress,
              // Automatically update shelf based on progress
              shelf: progress === 100 ? 'completed' : (book.shelf || 'reading'),
              // Aktualisiere den Zeitstempel der letzten Änderung
              lastOpened: new Date()
            } 
          : book
      )
    );
  };

  // Function to add a new book to the library
  const addBook = (book: LibraryBook) => {
    setBooks(prevBooks => {
      // Prüfe, ob das Buch bereits in der Bibliothek ist
      const existingBook = prevBooks.find(b => b.id === book.id);
      if (existingBook) {
        return prevBooks;
      }
      return [...prevBooks, book];
    });
  };

  // Neue Funktion zum Aktualisieren der Gesamtseitenzahl eines Buches
  const updateTotalPages = (bookId: string, totalPages: number) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { ...book, totalPages } 
          : book
      )
    );
  };

  return {
    books,
    filteredBooks,
    addToShelf,
    removeFromShelf,
    updateProgress,
    addBook,
    updateTotalPages
  };
}
