
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import BookCard from '@/components/books/BookCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, BarChart2, Clock, Coffee, Book, Sun, Moon, Star, RefreshCw } from 'lucide-react';
import { searchBooks, SearchOptions, SearchResult } from '@/services/bookService';
import { useToast } from '@/hooks/use-toast';

const Recommendations = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [moodBooks, setMoodBooks] = useState<Record<string, SearchResult[]>>({});
  
  // Sample mood categories and their query terms for the API
  const moodCategories = [
    { id: 'happy', icon: <Sun className="h-5 w-5" />, label: language === 'de' ? 'Fröhlich' : 'Happy', query: 'comedy humor' },
    { id: 'thoughtful', icon: <Coffee className="h-5 w-5" />, label: language === 'de' ? 'Nachdenklich' : 'Thoughtful', query: 'philosophy mindfulness' },
    { id: 'exciting', icon: <Star className="h-5 w-5" />, label: language === 'de' ? 'Aufregend' : 'Exciting', query: 'thriller adventure' },
    { id: 'relaxing', icon: <Moon className="h-5 w-5" />, label: language === 'de' ? 'Entspannend' : 'Relaxing', query: 'travel memoir' },
    { id: 'educational', icon: <Book className="h-5 w-5" />, label: language === 'de' ? 'Lehrreich' : 'Educational', query: 'science history' },
    { id: 'quick', icon: <Clock className="h-5 w-5" />, label: language === 'de' ? 'Schnell lesbar' : 'Quick Read', query: 'short stories novella' },
  ];
  
  // Fetch books based on mood
  const fetchMoodBooks = async (moodId: string) => {
    setIsLoading(true);
    const mood = moodCategories.find(m => m.id === moodId);
    
    if (!mood) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Check if we already have books for this mood
      if (moodBooks[moodId] && moodBooks[moodId].length > 0) {
        setSelectedMood(moodId);
        setIsLoading(false);
        return;
      }
      
      const options: SearchOptions = {
        query: mood.query,
        limit: 8
      };
      
      const books = await searchBooks(options);
      
      setMoodBooks(prev => ({
        ...prev,
        [moodId]: books
      }));
      setSelectedMood(moodId);
    } catch (error) {
      console.error('Error fetching mood books:', error);
      toast({
        title: language === 'de' ? 'Fehler beim Laden' : 'Error Loading Books',
        description: language === 'de' 
          ? 'Buchempfehlungen konnten nicht geladen werden.' 
          : 'Failed to load book recommendations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    fetchMoodBooks(moodId);
  };
  
  const handleRefresh = () => {
    if (selectedMood) {
      // Clear current mood's books to force a new fetch
      setMoodBooks(prev => ({
        ...prev,
        [selectedMood]: []
      }));
      fetchMoodBooks(selectedMood);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('recommendations')}</h1>
            <p className="text-muted-foreground">
              {language === 'de'
                ? 'Entdecke Bücher basierend auf deiner Stimmung'
                : 'Discover books based on your mood'}
            </p>
          </div>
          
          {selectedMood && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {language === 'de' ? 'Aktualisieren' : 'Refresh'}
            </Button>
          )}
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {language === 'de' ? 'Wähle deine Stimmung' : 'Choose your mood'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {moodCategories.map(mood => (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? "default" : "outline"}
                  className="h-auto flex flex-col py-4 px-2 space-y-2"
                  onClick={() => handleMoodSelect(mood.id)}
                  disabled={isLoading}
                >
                  <div className="h-8 w-8 flex items-center justify-center">
                    {mood.icon}
                  </div>
                  <span>{mood.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {selectedMood && !isLoading && moodBooks[selectedMood]?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {language === 'de' ? 'Basierend auf deiner Stimmung' : 'Based on your mood'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {moodBooks[selectedMood].map((book: SearchResult) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverUrl={book.coverUrl || ''}
                  rating={book.rating}
                />
              ))}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {selectedMood && !isLoading && moodBooks[selectedMood]?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'de' 
                ? 'Keine Bücher gefunden. Bitte versuche eine andere Stimmung.'
                : 'No books found. Please try a different mood.'}
            </p>
          </div>
        )}
        
        {!selectedMood && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'de' 
                ? 'Wähle eine Stimmung, um Buchempfehlungen zu erhalten' 
                : 'Choose a mood to get book recommendations'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recommendations;
