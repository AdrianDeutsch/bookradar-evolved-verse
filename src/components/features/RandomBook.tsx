
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { fetchBookOfTheDay } from '@/services/bookService';
import { Loader2, RefreshCcw, ExternalLink, BookIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RandomBook = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomBook = async () => {
    setIsLoading(true);
    
    try {
      const newBook = await fetchBookOfTheDay();
      
      if (newBook) {
        setBook(newBook);
        toast({
          title: language === 'de' ? 'Zufälliges Buch' : 'Random Book',
          description: language === 'de' 
            ? 'Ein neues Buch wurde geladen' 
            : 'A new book has been loaded',
        });
      }
    } catch (error) {
      console.error('Failed to fetch random book:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de' 
          ? 'Konnte kein zufälliges Buch laden' 
          : 'Failed to load random book',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewBookDetails = () => {
    if (book?.id) {
      navigate(`/book/${book.id}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{language === 'de' ? 'Zufälliges Buch' : 'Random Book'}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchRandomBook} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[320px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : book ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="h-64 w-48 relative">
              {book.coverUrl ? (
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="h-full w-full object-cover rounded-md shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center rounded-md">
                  <BookIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-muted-foreground">{book.author}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px] space-y-4">
            <p className="text-muted-foreground text-center">
              {language === 'de' 
                ? 'Klicke auf den Button oben, um ein zufälliges Buch zu laden'
                : 'Click the button above to load a random book'}
            </p>
            <Button onClick={fetchRandomBook}>
              {language === 'de' ? 'Zufälliges Buch laden' : 'Load Random Book'}
            </Button>
          </div>
        )}
      </CardContent>
      
      {book && (
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={viewBookDetails}
            variant="outline"
          >
            {language === 'de' ? 'Details anzeigen' : 'View Details'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default RandomBook;
