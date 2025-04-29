
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import BookCard from '@/components/books/BookCard';
import { searchBooks, SearchResult } from '@/services/bookService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sun, Moon, Coffee, Zap, Smile, BookOpen } from 'lucide-react';

interface Mood {
  id: string;
  label: {
    en: string;
    de: string;
  };
  icon: React.ReactNode;
  searchTerms: string[];
}

const moods: Mood[] = [
  {
    id: 'happy',
    label: { en: 'Happy', de: 'Fröhlich' },
    icon: <Sun className="h-6 w-6" />,
    searchTerms: ['comedy', 'humor', 'happiness', 'funny']
  },
  {
    id: 'reflective',
    label: { en: 'Reflective', de: 'Nachdenklich' },
    icon: <Coffee className="h-6 w-6" />,
    searchTerms: ['philosophy', 'memoir', 'meditation', 'mindfulness']
  },
  {
    id: 'exciting',
    label: { en: 'Exciting', de: 'Aufregend' },
    icon: <Zap className="h-6 w-6" />,
    searchTerms: ['adventure', 'thriller', 'action', 'suspense']
  },
  {
    id: 'calming',
    label: { en: 'Calming', de: 'Beruhigend' },
    icon: <Moon className="h-6 w-6" />,
    searchTerms: ['poetry', 'nature', 'relaxation', 'comfort']
  },
  {
    id: 'inspiring',
    label: { en: 'Inspiring', de: 'Inspirierend' },
    icon: <Smile className="h-6 w-6" />,
    searchTerms: ['motivation', 'biography', 'success', 'self-improvement']
  },
];

const MoodMatching = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [books, setBooks] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedMood) return;
    
    const fetchBooksByMood = async () => {
      setIsLoading(true);
      
      try {
        // Get the corresponding mood object
        const mood = moods.find(m => m.id === selectedMood);
        
        if (!mood) {
          setBooks([]);
          return;
        }
        
        // Choose a random search term from the mood's searchTerms array
        const randomTerm = mood.searchTerms[Math.floor(Math.random() * mood.searchTerms.length)];
        
        // Search for books with the random term
        const results = await searchBooks({ 
          query: randomTerm, 
          limit: 6 
        });
        
        if (results.length === 0) {
          toast({
            title: language === 'de' ? 'Keine Bücher gefunden' : 'No books found',
            description: language === 'de' 
              ? 'Versuche es mit einer anderen Stimmung' 
              : 'Try a different mood',
            variant: 'destructive',
          });
        }
        
        setBooks(results);
      } catch (error) {
        console.error('Error fetching mood books:', error);
        toast({
          title: language === 'de' ? 'Fehler' : 'Error',
          description: language === 'de' 
            ? 'Bücher konnten nicht geladen werden' 
            : 'Failed to load books',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooksByMood();
  }, [selectedMood, toast, language]);

  const handleMoodSelect = (moodId: string) => {
    // If the same mood is selected, refresh recommendations
    if (moodId === selectedMood) {
      // Re-trigger the effect by setting to null briefly
      setSelectedMood(null);
      setTimeout(() => setSelectedMood(moodId), 100);
      return;
    }
    
    setSelectedMood(moodId);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'de' ? 'Wähle deine Stimmung' : 'Choose your mood'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {moods.map(mood => (
              <Button
                key={mood.id}
                variant={selectedMood === mood.id ? "default" : "outline"}
                className="h-auto flex flex-col py-4 px-2 space-y-2"
                onClick={() => handleMoodSelect(mood.id)}
              >
                <div className="h-8 w-8 flex items-center justify-center">
                  {mood.icon}
                </div>
                <span>{language === 'de' ? mood.label.de : mood.label.en}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedMood && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {language === 'de' 
              ? `Passend zu deiner ${moods.find(m => m.id === selectedMood)?.label.de} Stimmung` 
              : `Matching your ${moods.find(m => m.id === selectedMood)?.label.en} mood`
            }
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverUrl={book.coverUrl || ''}
                  rating={4.5} // Default rating since API doesn't provide this
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {language === 'de'
                  ? 'Keine Bücher gefunden. Versuche eine andere Stimmung.'
                  : 'No books found. Try a different mood.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodMatching;
