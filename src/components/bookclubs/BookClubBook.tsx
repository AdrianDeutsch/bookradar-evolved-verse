
import React from 'react';
import { LibraryBook } from '@/hooks/useLocalLibrary';
import BookCard from '@/components/books/BookCard';
import { useLanguage } from '@/context/LanguageContext';
import { Book } from 'lucide-react';

interface BookClubBookProps {
  book: LibraryBook | null;
  showTitle?: boolean;
}

const BookClubBook = ({ book, showTitle = true }: BookClubBookProps) => {
  const { language } = useLanguage();
  
  if (!book) {
    return (
      <div className="p-8 text-center border rounded-md bg-muted/20">
        <Book className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <h4 className="font-medium mb-1">
          {language === 'de' ? 'Kein Buch ausgewählt' : 'No book selected'}
        </h4>
        <p className="text-sm text-muted-foreground">
          {language === 'de'
            ? 'Der Gruppenadministrator hat noch kein Buch festgelegt'
            : 'The group administrator has not set a book yet'}
        </p>
      </div>
    );
  }
  
  return (
    <div className={showTitle ? "space-y-2" : ""}>
      {showTitle && (
        <h3 className="text-lg font-medium mb-2">
          {language === 'de' ? 'Aktuelles Buch' : 'Current Book'}
        </h3>
      )}
      <div className="w-48">
        <BookCard
          id={book.id}
          title={book.title}
          author={book.author}
          coverUrl={book.coverUrl}
          rating={book.rating}
        />
      </div>
    </div>
  );
};

export default BookClubBook;
