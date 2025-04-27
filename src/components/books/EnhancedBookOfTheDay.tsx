import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Quote, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { fetchBookOfTheDay, SearchResult } from '@/services/bookService';
import { fetchBookRelatedQuote, Quote as QuoteType } from '@/services/quoteService';
import { storage } from '@/utils/localStorage';

const BOOK_OF_DAY_KEY = 'bookradar_book_of_day';
const QUOTE_OF_DAY_KEY = 'bookradar_quote_of_day';
const LAST_UPDATED_KEY = 'bookradar_book_last_updated';

const EnhancedBookOfTheDay = () => {
  const { t } = useLanguage();
  const [book, setBook] = useState<SearchResult | null>(null);
  const [quote, setQuote] = useState<QuoteType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookAndQuote();
  }, []);

  const loadBookAndQuote = async () => {
    setLoading(true);
    
    // Check if we have a stored book and quote, and if it's still valid (same day)
    const lastUpdated = storage.get<string>(LAST_UPDATED_KEY, '');
    const today = new Date().toDateString();
    
    if (lastUpdated === today) {
      // Use stored data if it's from today
      const storedBook = storage.get<SearchResult | null>(BOOK_OF_DAY_KEY, null);
      const storedQuote = storage.get<QuoteType | null>(QUOTE_OF_DAY_KEY, null);
      
      if (storedBook && storedQuote) {
        setBook(storedBook);
        setQuote(storedQuote);
        setLoading(false);
        return;
      }
    }
    
    // Otherwise fetch new data
    try {
      // Fetch book and quote in parallel
      const [newBook, newQuote] = await Promise.all([
        fetchBookOfTheDay(),
        fetchBookRelatedQuote()
      ]);
      
      if (newBook) setBook(newBook);
      if (newQuote) setQuote(newQuote);
      
      // Store the new data
      storage.set(BOOK_OF_DAY_KEY, newBook);
      storage.set(QUOTE_OF_DAY_KEY, newQuote);
      storage.set(LAST_UPDATED_KEY, today);
    } catch (error) {
      console.error('Error loading book of the day:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookAndQuote();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border border-border">
        <div className="aspect-[3/2] bg-muted relative">
          <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full mb-2" />
        </CardContent>
      </Card>
    );
  }

  if (!book) {
    return (
      <Card className="overflow-hidden border border-border">
        <div className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {t('language') === 'de' 
              ? 'Konnte das Buch des Tages nicht laden.' 
              : 'Unable to load book of the day.'}
          </p>
          <Button onClick={handleRefresh} className="mt-4" disabled={refreshing}>
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t('language') === 'de' ? 'Wird aktualisiert...' : 'Refreshing...'}
              </>
            ) : (
              t('refresh')
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border hover:shadow-md transition-shadow duration-200">
      <div className="aspect-[3/2] bg-muted relative">
        {(book.coverUrl || book.cover) ? (
          <img 
            src={book.coverUrl || book.cover || ''} 
            alt={book.title} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-lg leading-tight">
            <Link to={`/book/${book.id}`} className="hover:underline">
              {book.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>

        {quote && (
          <div className="border-l-4 border-primary/20 pl-3 italic text-sm text-muted-foreground">
            <div className="flex gap-1 mb-1">
              <Quote className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>"{quote.content}"</p>
            </div>
            <p className="text-right text-xs">— {quote.author}</p>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Link to={`/book/${book.id}`}>
            <Button variant="outline" size="sm">
              {t('language') === 'de' ? 'Details' : 'Details'}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={refreshing}
            aria-label={t('language') === 'de' ? 'Aktualisieren' : 'Refresh'}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedBookOfTheDay;
