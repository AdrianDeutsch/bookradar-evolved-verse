
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import SearchBar from '@/components/search/SearchBar';
import EnhancedBookOfTheDay from '@/components/books/EnhancedBookOfTheDay';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Star, BarChart2 } from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [query, navigate]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  return (
    <Layout>
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            BookRadar
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('language') === 'de' 
              ? 'Finde neue Bücher nach deinem Geschmack' 
              : 'Find new books tailored to your taste'}
          </p>
        </div>

        <div className="w-full max-w-xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="w-full max-w-4xl space-y-8 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-medium text-center">
            {t('language') === 'de' ? 'Buch des Tages' : 'Book of the Day'}
          </h2>
          <EnhancedBookOfTheDay />
        </div>
          
        <div className="w-full max-w-4xl space-y-6 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-xl font-medium text-center">
            {t('language') === 'de' ? 'Entdecken' : 'Explore'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-8 flex flex-col items-center justify-center gap-3 hover:bg-accent/50"
              onClick={() => navigate('/search')}
            >
              <Search className="h-6 w-6 text-primary" />
              <span className="text-base font-medium">
                {t('language') === 'de' ? 'Erweiterte Suche' : 'Advanced Search'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-8 flex flex-col items-center justify-center gap-3 hover:bg-accent/50"
              onClick={() => navigate('/library')}
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-base font-medium">
                {t('language') === 'de' ? 'Meine Bibliothek' : 'My Library'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-8 flex flex-col items-center justify-center gap-3 hover:bg-accent/50"
              onClick={() => navigate('/recommendations')}
            >
              <Star className="h-6 w-6 text-primary" />
              <span className="text-base font-medium">
                {t('language') === 'de' ? 'Empfehlungen' : 'Recommendations'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-8 flex flex-col items-center justify-center gap-3 hover:bg-accent/50"
              onClick={() => navigate('/statistics')}
            >
              <BarChart2 className="h-6 w-6 text-primary" />
              <span className="text-base font-medium">
                {t('language') === 'de' ? 'Statistiken' : 'Statistics'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
