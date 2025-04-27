
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import SearchBar from '@/components/search/SearchBar';
import EnhancedBookOfTheDay from '@/components/books/EnhancedBookOfTheDay';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-10 md:py-24 space-y-10">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold">
            BookRadar
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('language') === 'de' 
              ? 'Finde neue Bücher nach deinem Geschmack' 
              : 'Find new books tailored to your taste'}
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          <div>
            <h2 className="text-xl font-bold mb-3">
              {t('language') === 'de' ? 'Buch des Tages' : 'Book of the Day'}
            </h2>
            <EnhancedBookOfTheDay />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {t('language') === 'de' ? 'Entdecken' : 'Explore'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center"
                onClick={() => navigate('/search')}
              >
                <span className="text-lg font-medium">
                  {t('language') === 'de' ? 'Erweiterte Suche' : 'Advanced Search'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('language') === 'de' ? 'Nach Genre, Jahr, etc.' : 'By genre, year, etc.'}
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center"
                onClick={() => navigate('/statistics')}
              >
                <span className="text-lg font-medium">
                  {t('language') === 'de' ? 'Statistiken' : 'Statistics'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('language') === 'de' ? 'Lesetrends' : 'Reading trends'}
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center"
                onClick={() => navigate('/library')}
              >
                <span className="text-lg font-medium">
                  {t('language') === 'de' ? 'Meine Bibliothek' : 'My Library'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('language') === 'de' ? 'Gelesene Bücher' : 'Read books'}
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center"
                onClick={() => navigate('/recommendations')}
              >
                <span className="text-lg font-medium">
                  {t('language') === 'de' ? 'Empfehlungen' : 'Recommendations'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('language') === 'de' ? 'Für dich ausgewählt' : 'Picked for you'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
