
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import BookOfTheDay from '@/components/books/BookOfTheDay';
import BookCard from '@/components/books/BookCard';
import SearchBar from '@/components/search/SearchBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Calendar, Star, Smile, HelpCircle, RefreshCcw } from 'lucide-react';
import { searchBooks, SearchResult } from '@/services/bookService';
import { useToast } from '@/hooks/use-toast';

// Import our feature components
import Quiz from '@/components/features/Quiz';
import MoodMatching from '@/components/features/MoodMatching';
import RandomBook from '@/components/features/RandomBook';

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // States für dynamisch geladene Bücher
  const [recommendedBooks, setRecommendedBooks] = useState<SearchResult[]>([]);
  const [recentBooks, setRecentBooks] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Funktion zum Laden der empfohlenen Bücher
  const loadRecommendedBooks = async () => {
    try {
      const books = await searchBooks({
        query: language === 'de' ? 'bestseller roman' : 'bestseller fiction',
        limit: 4
      });
      setRecommendedBooks(books);
    } catch (error) {
      console.error('Error loading recommended books:', error);
      toast({
        title: language === 'de' ? 'Fehler beim Laden' : 'Error Loading',
        description: language === 'de' 
          ? 'Empfohlene Bücher konnten nicht geladen werden.' 
          : 'Failed to load recommended books.',
        variant: 'destructive',
      });
    }
  };

  // Funktion zum Laden der kürzlich hinzugefügten Bücher
  const loadRecentBooks = async () => {
    try {
      const books = await searchBooks({
        query: language === 'de' ? 'neu erschienen' : 'new release',
        limit: 4
      });
      setRecentBooks(books);
    } catch (error) {
      console.error('Error loading recent books:', error);
      toast({
        title: language === 'de' ? 'Fehler beim Laden' : 'Error Loading',
        description: language === 'de' 
          ? 'Aktuelle Bücher konnten nicht geladen werden.' 
          : 'Failed to load recent books.',
        variant: 'destructive',
      });
    }
    finally {
      setIsLoading(false);
    }
  };

  // Bücher beim ersten Laden holen
  useEffect(() => {
    setIsLoading(true);
    const loadData = async () => {
      await Promise.all([
        loadRecommendedBooks(),
        loadRecentBooks()
      ]);
    };
    
    loadData();
  }, [language]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, we would perform a search request here
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Layout>
      <div className="space-y-12 relative">
        {/* App header with centered logo and improved spacing */}
        <div className="flex flex-col items-center space-y-5 pt-10 md:pt-12 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 animate-fade-in">
            <Book className="h-8 w-8 text-bookradar-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">BookRadar</h1>
          </div>
          <p className="text-muted-foreground text-center px-4 max-w-xl animate-fade-in">
            {t('language') === 'de' 
              ? 'Deine intelligente Lese-App mit sozialen Features und Gamification'
              : 'Your intelligent reading app with social features and gamification'}
          </p>
        </div>

        {/* Search bar with increased spacing */}
        <div className="max-w-2xl mx-auto px-4 pt-2 animate-fade-in">
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        </div>

        {/* Main content with better spacing */}
        <div className="space-y-20 mt-10 px-4">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <BookOfTheDay />
          </div>

          {/* Featured sections */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-2xl font-bold mb-6">{t('language') === 'de' ? 'Entdecke BookRadar' : 'Discover BookRadar'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Smile className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">{t('language') === 'de' ? 'Stimmungsbasierte Empfehlungen' : 'Mood-Based Recommendations'}</h3>
                  <p className="text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Finde Bücher, die zu deiner aktuellen Stimmung passen'
                      : 'Find books that match your current mood'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/recommendations')}
                    className="mt-2"
                  >
                    {t('language') === 'de' ? 'Stimmung wählen' : 'Choose Mood'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <HelpCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">{t('language') === 'de' ? 'Literatur-Quiz' : 'Literature Quiz'}</h3>
                  <p className="text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Teste dein Wissen über berühmte Bücher und Autoren'
                      : 'Test your knowledge of famous books and authors'}
                  </p>
                  <Button 
                    variant="outline"
                    className="mt-2"
                    onClick={() => document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t('language') === 'de' ? 'Quiz starten' : 'Start Quiz'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">{t('language') === 'de' ? 'Lesestatistiken' : 'Reading Statistics'}</h3>
                  <p className="text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Verfolge deinen Lesefortschritt und analysiere deine Lesegewohnheiten'
                      : 'Track your reading progress and analyze your reading habits'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/statistics')}
                    className="mt-2"
                  >
                    {t('language') === 'de' ? 'Statistiken ansehen' : 'View Statistics'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">{t('language') === 'de' ? 'Leseziele' : 'Reading Goals'}</h3>
                  <p className="text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Setze persönliche Leseziele und verfolge deinen Fortschritt'
                      : 'Set personal reading goals and track your progress'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/library')}
                    className="mt-2"
                  >
                    {t('language') === 'de' ? 'Ziel setzen' : 'Set Goal'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <RefreshCcw className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">{t('language') === 'de' ? 'Zufälliges Buch' : 'Random Book'}</h3>
                  <p className="text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Entdecke neue Bücher mit unserer Zufallsfunktion'
                      : 'Discover new books with our randomizer'}
                  </p>
                  <Button 
                    variant="outline"
                    className="mt-2"
                    onClick={() => document.getElementById('random-book-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t('language') === 'de' ? 'Zufallsbuch finden' : 'Find Random Book'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Book className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">{t('language') === 'de' ? 'Meine Bibliothek' : 'My Library'}</h3>
                  <p className="text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Organisiere deine persönliche Büchersammlung'
                      : 'Organize your personal book collection'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/library')}
                    className="mt-2"
                  >
                    {t('language') === 'de' ? 'Zur Bibliothek' : 'Go to Library'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Tabs defaultValue="recommended">
              <TabsList className="mx-auto flex justify-center mb-8">
                <TabsTrigger value="recommended">
                  {t('language') === 'de' ? 'Empfehlungen' : 'Recommended'}
                </TabsTrigger>
                <TabsTrigger value="recent">
                  {t('language') === 'de' ? 'Kürzlich hinzugefügt' : 'Recently Added'}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="recommended" className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recommendedBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendedBooks.map(book => (
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
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {language === 'de' 
                        ? 'Keine Buchempfehlungen verfügbar.' 
                        : 'No book recommendations available.'}
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={loadRecommendedBooks}
                    >
                      {language === 'de' ? 'Erneut versuchen' : 'Try Again'}
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="recent" className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recentBooks.map(book => (
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
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {language === 'de' 
                        ? 'Keine neuen Bücher verfügbar.' 
                        : 'No new books available.'}
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={loadRecentBooks}
                    >
                      {language === 'de' ? 'Erneut versuchen' : 'Try Again'}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Quiz section */}
          <div id="quiz-section" className="pt-10 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <h2 className="text-2xl font-bold mb-6">
              {t('language') === 'de' ? 'Literatur-Quiz' : 'Literature Quiz'}
            </h2>
            <Quiz />
          </div>

          {/* Random book section */}
          <div id="random-book-section" className="pt-10 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <h2 className="text-2xl font-bold mb-6">
              {t('language') === 'de' ? 'Zufälliges Buch' : 'Random Book'}
            </h2>
            <div className="max-w-md mx-auto">
              <RandomBook />
            </div>
          </div>

          {/* Mood matching preview */}
          <div className="pt-10 animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <h2 className="text-2xl font-bold mb-6">
              {t('language') === 'de' ? 'Stimmungsbasierte Empfehlungen' : 'Mood-Based Recommendations'}
            </h2>
            <MoodMatching />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
