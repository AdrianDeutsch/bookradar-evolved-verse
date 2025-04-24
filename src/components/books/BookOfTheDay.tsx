
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Calendar } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  quote: string;
}

const BookOfTheDay = () => {
  const { t } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [nextBookTime, setNextBookTime] = useState<string>('');
  
  // Sample data - in a real app, this would come from an API
  const sampleBooks = [
    {
      id: '1',
      title: 'Der Alchimist',
      author: 'Paulo Coelho',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg',
      quote: 'Wenn du etwas willst, dann wird das ganze Universum sich verschwören, damit du deinen Wunsch erfüllst.'
    },
    {
      id: '2',
      title: 'Harry Potter und der Stein der Weisen',
      author: 'J.K. Rowling',
      coverUrl: 'https://m.media-amazon.com/images/I/51LiAbzDSxL._SY445_SX342_.jpg',
      quote: 'Es sind nicht unsere Fähigkeiten, die zeigen, wer wir sind, sondern unsere Entscheidungen.'
    },
    {
      id: '3',
      title: 'Der kleine Prinz',
      author: 'Antoine de Saint-Exupéry',
      coverUrl: 'https://m.media-amazon.com/images/I/41bdH6Y3MbL._SY445_SX342_.jpg',
      quote: 'Man sieht nur mit dem Herzen gut. Das Wesentliche ist für die Augen unsichtbar.'
    }
  ];

  useEffect(() => {
    // In a real app, we'd check if today's book is already saved in localStorage
    // and only fetch a new one if needed
    const savedBookDate = localStorage.getItem('bookradar-book-of-the-day-date');
    const today = new Date().toDateString();
    
    if (savedBookDate === today) {
      const savedBook = localStorage.getItem('bookradar-book-of-the-day');
      if (savedBook) {
        setBook(JSON.parse(savedBook));
      } else {
        selectRandomBook();
      }
    } else {
      selectRandomBook();
      localStorage.setItem('bookradar-book-of-the-day-date', today);
    }
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const selectRandomBook = () => {
    const randomIndex = Math.floor(Math.random() * sampleBooks.length);
    const selectedBook = sampleBooks[randomIndex];
    setBook(selectedBook);
    localStorage.setItem('bookradar-book-of-the-day', JSON.stringify(selectedBook));
  };
  
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
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-auto rounded-lg shadow-md object-cover"
              />
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
                
                <Button className="bg-bookradar-primary hover:bg-bookradar-secondary">
                  {t('moreInfo')}
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
