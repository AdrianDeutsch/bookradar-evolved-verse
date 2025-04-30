
import React from 'react';
import { Book, BookOpen, Bookmark, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import BookCard from './BookCard';
import BookListItem from './BookListItem';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface BookShelfProps {
  books: any[];
  shelfType: 'all' | 'reading' | 'want-to-read' | 'completed';
  emptyMessage: string;
  viewMode?: 'grid' | 'list';
}

const BookShelf: React.FC<BookShelfProps> = ({ 
  books, 
  shelfType, 
  emptyMessage,
  viewMode = 'grid'
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [currentViewMode, setCurrentViewMode] = React.useState<'grid' | 'list'>(
    isMobile ? 'list' : viewMode
  );

  // Update view mode when screen size changes
  React.useEffect(() => {
    if (isMobile && currentViewMode === 'grid') {
      setCurrentViewMode('list');
    }
  }, [isMobile]);
  
  const getShelfIcon = () => {
    switch (shelfType) {
      case 'reading':
        return <BookOpen className="h-8 w-8 text-bookradar-primary" />;
      case 'want-to-read':
        return <Bookmark className="h-8 w-8 text-bookradar-primary" />;
      case 'completed':
        return <Check className="h-8 w-8 text-bookradar-primary" />;
      default:
        return <Book className="h-8 w-8 text-bookradar-primary" />;
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {!isMobile && getShelfIcon()}
          <h2 className="text-xl font-semibold">
            {shelfType === 'all' && (t('language') === 'de' ? 'Alle Bücher' : 'All Books')}
            {shelfType === 'reading' && (t('language') === 'de' ? 'Aktuelle Lektüre' : 'Currently Reading')}
            {shelfType === 'want-to-read' && (t('language') === 'de' ? 'Leseliste' : 'Want to Read')}
            {shelfType === 'completed' && (t('language') === 'de' ? 'Abgeschlossen' : 'Completed')}
          </h2>
        </div>
        
        {books.length > 0 && !isMobile && (
          <div className="flex gap-2">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentViewMode('grid')}
              className="px-3"
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
              </div>
              <span className="ml-2">{t('language') === 'de' ? 'Raster' : 'Grid'}</span>
            </Button>
            
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentViewMode('list')}
              className="px-3"
            >
              <div className="flex flex-col gap-0.5 items-start">
                <div className="w-4 h-1 bg-current rounded-sm"></div>
                <div className="w-4 h-1 bg-current rounded-sm"></div>
                <div className="w-4 h-1 bg-current rounded-sm"></div>
              </div>
              <span className="ml-2">{t('language') === 'de' ? 'Liste' : 'List'}</span>
            </Button>
          </div>
        )}
      </div>

      {books.length > 0 ? (
        currentViewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map(book => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                coverUrl={book.coverUrl}
                rating={book.rating}
                progress={book.progress}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {books.map(book => (
              <BookListItem
                key={book.id}
                book={book}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            {getShelfIcon()}
          </div>
          <p className="text-muted-foreground mb-4">
            {emptyMessage}
          </p>
          <Button variant="outline">
            {t('language') === 'de' ? 'Bücher durchstöbern' : 'Browse books'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookShelf;
