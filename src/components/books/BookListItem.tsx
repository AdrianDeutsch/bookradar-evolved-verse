
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, ArrowRight, BookOpen, BookmarkPlus, Check, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookListItemProps {
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    rating?: number;
    progress?: number;
    shelf?: string;
    lastOpened?: Date;
  };
}

const BookListItem: React.FC<BookListItemProps> = ({ book }) => {
  const { t } = useLanguage();
  const [imageError, setImageError] = React.useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  // Create a nice background color based on title for the placeholder
  const getColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = ((hash & 0xFFFFFF) % 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  return (
    <div className="border rounded-md overflow-hidden flex animate-fade-in hover:shadow-md transition-shadow">
      <Link to={`/book/${book.id}`} className="flex-shrink-0 w-16 h-24 md:w-24 md:h-36">
        {book.coverUrl && !imageError ? (
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover" 
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
            style={{ backgroundColor: getColorFromString(book.title) }}
          >
            <Book className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-xs font-medium text-foreground line-clamp-1">{book.title}</span>
          </div>
        )}
      </Link>
      
      <div className="flex-grow p-3 md:p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <Link to={`/book/${book.id}`} className="group">
              <h3 className="font-semibold line-clamp-1 md:text-lg group-hover:text-bookradar-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            </Link>
            
            <div className="ml-2 flex-shrink-0">
              {book.rating && (
                <div className="bg-bookradar-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                  {book.rating}
                </div>
              )}
            </div>
          </div>
          
          {typeof book.progress === 'number' && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {t('language') === 'de' ? 'Fortschritt' : 'Progress'}
                </span>
                <span className="font-medium">{book.progress}%</span>
              </div>
              <Progress value={book.progress} className="h-1.5" />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <Button size="sm" variant="default" asChild>
              <Link to={`/book/${book.id}/read`}>
                <BookOpen className="h-4 w-4" />
                <span className="md:hidden sr-only">{t('startReading')}</span>
                <span className="hidden md:inline">{t('startReading')}</span>
              </Link>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                {t('language') === 'de' ? 'Aktionen' : 'Actions'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{book.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Check className="mr-2 h-4 w-4" />
                <span>{t('language') === 'de' ? 'Als gelesen markieren' : 'Mark as read'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{t('language') === 'de' ? 'Zu "Lesend" verschieben' : 'Move to reading'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                <span>{t('language') === 'de' ? 'Zur Leseliste hinzufügen' : 'Add to reading list'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{t('language') === 'de' ? 'Entfernen' : 'Remove'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default BookListItem;
