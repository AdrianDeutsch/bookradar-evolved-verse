
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, ExternalLink, BookIcon, RefreshCcw } from 'lucide-react';
import { fetchBookOfTheDay, getBookDetails } from '@/services/bookService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BookWithQuote {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  publishYear?: number;
  quote: string;
}

// Array of literary quotes about books and reading
const quotes = [
  'Man sieht nur mit dem Herzen gut. Das Wesentliche ist für die Augen unsichtbar.',
  'Es sind nicht unsere Fähigkeiten, die zeigen, wer wir sind, sondern unsere Entscheidungen.',
  'Wenn du etwas willst, dann wird das ganze Universum sich verschwören, damit du deinen Wunsch erfüllst.',
  'Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt.',
  'Alles, was wir sehen, ist eine Perspektive, nicht die Wahrheit.',
  'Ein Buch ist wie ein Garten, den man in der Tasche trägt.',
  'Bücher sind die leisesten und beständigsten Freunde, sie sind die zugänglichsten und weisesten Ratgeber und die geduldigsten Lehrer.',
  'Das Paradies habe ich mir immer als eine Art Bibliothek vorgestellt.',
  'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
  'Books are a uniquely portable magic.',
  'I do believe something very magical can happen when you read a good book.',
  'The more that you read, the more things you will know. The more that you learn, the more places you\'ll go.',
  'Books are mirrors: you only see in them what you already have inside you.',
  'A book is a dream that you hold in your hand.',
  'Reading is an exercise in empathy; an exercise in walking in someone else\'s shoes for a while.',
  'Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers.'
];

const BookOfTheDay = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookWithQuote | null>(null);
  const [nextBookTime, setNextBookTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [coverError, setCoverError] = useState(false);
  
  const fetchBook = async (forceRefresh = false) => {
    // Check if today's book is already in localStorage and not forcing refresh
    const savedBookDate = localStorage.getItem('bookradar-book-of-the-day-date');
    const today = new Date().toDateString();
    
    if (!forceRefresh && savedBookDate === today) {
      const savedBook = localStorage.getItem('bookradar-book-of-the-day');
      if (savedBook) {
        try {
          const parsedBook = JSON.parse(savedBook);
          setBook(parsedBook);
          setIsLoading(false);
          // Pre-load the cover image
          if (parsedBook.coverUrl) {
            const img = new Image();
            img.src = parsedBook.coverUrl;
            img.onload = () => setCoverLoaded(true);
            img.onerror = () => setCoverError(true);
          }
          return;
        } catch (e) {
          // If parsing fails, continue to fetch a new book
          console.error("Failed to parse saved book:", e);
        }
      }
    }
    
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const newBook = await fetchBookOfTheDay();
      
      if (newBook) {
        // Add a random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const bookWithQuote = { ...newBook, quote: randomQuote };
        
        setBook(bookWithQuote);
        localStorage.setItem('bookradar-book-of-the-day', JSON.stringify(bookWithQuote));
        localStorage.setItem('bookradar-book-of-the-day-date', today);
        
        // Pre-load the cover image
        if (newBook.coverUrl) {
          setCoverLoaded(false);
          setCoverError(false);
          const img = new Image();
          img.src = newBook.coverUrl;
          img.onload = () => setCoverLoaded(true);
          img.onerror = () => setCoverError(true);
        }
        
        if (forceRefresh) {
          toast({
            title: language === 'de' ? 'Aktualisiert!' : 'Refreshed!',
            description: language === 'de' 
              ? 'Neues Buch des Tages geladen.'
              : 'New book of the day loaded.',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch book of the day:', error);
      toast({
        title: t('error'),
        description: language === 'de' 
          ? 'Konnte das Buch des Tages nicht laden'
          : 'Failed to load book of the day',
        variant: 'destructive',
      });
      setCoverError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchBook();
    
    // Update countdown
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [t, toast, language]);
  
  const updateCountdown = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setNextBookTime(`${hours}h ${minutes}m`);
  };

  const handleRefresh = () => {
    fetchBook(true);
  };

  const openBookDetails = () => {
    if (book) {
      navigate(`/book/${book.id}`);
    }
  };

  // Function to handle start reading button click
  const handleStartReading = () => {
    if (book) {
      navigate(`/book/${book.id}/read`);
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="flex gap-6">
              <div className="w-1/3">
                <div className="h-[200px] bg-muted rounded"></div>
              </div>
              <div className="w-2/3 space-y-4">
                <div className="h-6 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded w-full mt-6"></div>
                <div className="flex justify-between items-center mt-6">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-10 bg-muted rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!book) return null;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{t('bookOfTheDay')}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="text-white hover:text-white/80 hover:bg-black/20"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                {language === 'de' ? 'Neues Buch' : 'New Book'}
              </Button>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {book.coverUrl && !coverError ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className={`w-full h-auto rounded-lg shadow-md object-cover transition-opacity duration-300 ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="eager"
                  onLoad={() => setCoverLoaded(true)}
                  onError={(e) => {
                    setCoverError(true);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted rounded-lg shadow-md flex items-center justify-center">
                  <BookIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2 flex flex-col">
              <h3 className="text-2xl font-bold mb-1">{book.title}</h3>
              <p className="text-muted-foreground mb-4">{book.author}</p>
              
              <div className="flex-1">
                <blockquote className="border-l-4 border-bookradar-primary pl-4 italic">
                  "{book.quote}"
                </blockquote>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{nextBookTime}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    className="flex gap-2 items-center"
                    onClick={handleStartReading}
                  >
                    {language === 'de' ? 'Lesen' : 'Read'}
                  </Button>
                  
                  <Button 
                    className="bg-bookradar-primary hover:bg-bookradar-secondary flex gap-2 items-center"
                    onClick={openBookDetails}
                  >
                    {t('moreInfo')}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookOfTheDay;
