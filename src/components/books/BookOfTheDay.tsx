
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Calendar, ExternalLink } from 'lucide-react';
import { fetchBookOfTheDay, getBookDetails } from '@/services/bookService';
import { useToast } from '@/hooks/use-toast';

interface BookWithQuote {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  publishYear?: number;
  quote: string;
}

const quotes = [
  'Man sieht nur mit dem Herzen gut. Das Wesentliche ist für die Augen unsichtbar.',
  'Es sind nicht unsere Fähigkeiten, die zeigen, wer wir sind, sondern unsere Entscheidungen.',
  'Wenn du etwas willst, dann wird das ganze Universum sich verschwören, damit du deinen Wunsch erfüllst.',
  'Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt.',
  'Alles, was wir sehen, ist eine Perspektive, nicht die Wahrheit.',
  'Ein Buch ist wie ein Garten, den man in der Tasche trägt.',
  'Bücher sind die leisesten und beständigsten Freunde, sie sind die zugänglichsten und weisesten Ratgeber und die geduldigsten Lehrer.',
  'Das Paradies habe ich mir immer als eine Art Bibliothek vorgestellt.'
];

const BookOfTheDay = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [book, setBook] = useState<BookWithQuote | null>(null);
  const [nextBookTime, setNextBookTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBook = async () => {
      // Check if today's book is already in localStorage
      const savedBookDate = localStorage.getItem('bookradar-book-of-the-day-date');
      const today = new Date().toDateString();
      
      if (savedBookDate === today) {
        const savedBook = localStorage.getItem('bookradar-book-of-the-day');
        if (savedBook) {
          setBook(JSON.parse(savedBook));
          setIsLoading(false);
          return;
        }
      }
      
      try {
        setIsLoading(true);
        const newBook = await fetchBookOfTheDay();
        
        if (newBook) {
          // Add a random quote
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          const bookWithQuote = { ...newBook, quote: randomQuote };
          
          setBook(bookWithQuote);
          localStorage.setItem('bookradar-book-of-the-day', JSON.stringify(bookWithQuote));
          localStorage.setItem('bookradar-book-of-the-day-date', today);
        }
      } catch (error) {
        console.error('Failed to fetch book of the day:', error);
        toast({
          title: t('error'),
          description: t('language') === 'de' 
            ? 'Konnte das Buch des Tages nicht laden'
            : 'Failed to load book of the day',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBook();
    
    // Update countdown
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [t, toast]);
  
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

  const openBookDetails = () => {
    if (book) {
      window.open(`https://openlibrary.org/works/${book.id}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-white">
            <h2 className="font-bold text-lg">{t('bookOfTheDay')}</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-auto rounded-lg shadow-md object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-muted-foreground">No Cover Available</span>
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
      </CardContent>
    </Card>
  );
};

export default BookOfTheDay;
