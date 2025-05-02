
import React, { useState } from 'react';
import { ReadingProgress } from "@/components/features/ReadingProgress";
import { QuoteCollection } from "@/components/features/QuoteCollection";
import { ReadingTimePlanner } from "@/components/features/ReadingTimePlanner";
import { useLocalLibrary } from "@/hooks/useLocalLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { SearchResult } from '@/services/bookService';

interface BookDetailExtensionsProps {
  book: SearchResult;
}

export function BookDetailExtensions({ book }: BookDetailExtensionsProps) {
  const { language } = useLanguage();
  const { books, addBook } = useLocalLibrary();
  const [activeTab, setActiveTab] = useState("progress");
  
  // Überprüfe, ob das Buch bereits in der Bibliothek ist
  const libraryBook = books.find(b => b.id === book.id);
  
  // Wenn das Buch noch nicht in der Bibliothek ist, füge es hinzu
  React.useEffect(() => {
    if (!libraryBook && book) {
      addBook({
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl || book.cover || '',
        shelf: 'reading'
      });
    }
  }, [book, libraryBook, addBook]);
  
  return (
    <div className="mt-8 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="progress">
            {language === 'de' ? 'Lesefortschritt' : 'Reading Progress'}
          </TabsTrigger>
          <TabsTrigger value="quotes">
            {language === 'de' ? 'Zitate' : 'Quotes'}
          </TabsTrigger>
          <TabsTrigger value="planner">
            {language === 'de' ? 'Leseplan' : 'Reading Plan'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="pt-4">
          <ReadingProgress 
            bookId={book.id} 
            bookTitle={book.title}
            totalPages={libraryBook?.totalPages || 300}
          />
        </TabsContent>
        
        <TabsContent value="quotes" className="pt-4">
          <QuoteCollection 
            bookId={book.id}
            bookTitle={book.title}
            author={book.author}
          />
        </TabsContent>
        
        <TabsContent value="planner" className="pt-4">
          <ReadingTimePlanner 
            bookId={book.id}
            bookTitle={book.title}
            totalPages={libraryBook?.totalPages || 300}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
