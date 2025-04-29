
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
import { Book, Calendar, Star, Smile, Quiz as QuizIcon, RefreshCcw } from 'lucide-react';
import { searchBooks } from '@/services/bookService';

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  
  useEffect(() => {
    const fetchBooksData = async () => {
      setLoading(true);
      try {
        // Fetch recent books with a query related to recent releases
        const recentData = await searchBooks({ 
          query: 'bestseller',
          limit: 4,
          sortBy: 'year'
        });
        
        // Fetch recommended books with a different query
        const recommendData = await searchBooks({ 
          query: 'classic literature',
          limit: 4 
        });
        
        setRecentBooks(recentData);
        setRecommendedBooks(recommendData);
      } catch (error) {
        console.error('Error fetching books:', error);
        // Use sample data as fallback
        setRecentBooks(sampleRecentBooks);
        setRecommendedBooks(sampleRecommendedBooks);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooksData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  // Refresh book collections with new random queries
  const handleRefreshCollections = async () => {
    setLoading(true);
    try {
      const queries = [
        'fantasy', 'mystery', 'romance', 'science fiction', 
        'thriller', 'historical', 'adventure', 'biography'
      ];
      
      // Pick two random different genres
      let idx1 = Math.floor(Math.random() * queries.length);
      let idx2 = (idx1 + 1 + Math.floor(Math.random() * (queries.length - 1))) % queries.length;
      
      const recentData = await searchBooks({ 
        query: queries[idx1],
        limit: 4,
        sortBy: 'year'
      });
      
      const recommendData = await searchBooks({ 
        query: queries[idx2],
        limit: 4 
      });
      
      setRecentBooks(recentData);
      setRecommendedBooks(recommendData);
    } catch (error) {
      console.error('Error refreshing books:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Sample data for fallback
  const sampleRecentBooks = [
    {
      id: '1',
      title: 'Der Alchimist',
      author: 'Paulo Coelho',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg',
      rating: 4.5
    },
    {
      id: '2',
      title: 'Harry Potter und der Stein der Weisen',
      author: 'J.K. Rowling',
      coverUrl: 'https://m.media-amazon.com/images/I/51LiAbzDSxL._SY445_SX342_.jpg',
      rating: 4.8
    },
    {
      id: '3',
      title: 'Der kleine Prinz',
      author: 'Antoine de Saint-Exupéry',
      coverUrl: 'https://m.media-amazon.com/images/I/41bdH6Y3MbL._SY445_SX342_.jpg',
      rating: 4.7
    },
    {
      id: '4',
      title: 'Die unendliche Geschichte',
      author: 'Michael Ende',
      coverUrl: 'https://m.media-amazon.com/images/I/51tRHbMpvnL.jpg',
      rating: 4.6
    }
  ];

  const sampleRecommendedBooks = [
    {
      id: '5',
      title: 'Der Herr der Ringe',
      author: 'J.R.R. Tolkien',
      coverUrl: 'https://m.media-amazon.com/images/I/51JWV1FxXdL._SY445_SX342_.jpg',
      rating: 4.9
    },
    {
      id: '6',
      title: 'Die Verwandlung',
      author: 'Franz Kafka',
      coverUrl: 'https://m.media-amazon.com/images/I/81vAAxPWkTL._AC_UF1000,1000_QL80_.jpg',
      rating: 4.3
    },
    {
      id: '7',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      coverUrl: 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',
      rating: 4.7
    },
    {
      id: '8',
      title: '1984',
      author: 'George Orwell',
      coverUrl: 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg',
      rating: 4.8
    }
  ];

  const renderBookGrid = (books) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map(book => (
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
  );

  const renderFeatureCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { 
          title: t('language') === 'de' ? 'Stimmungs-Empfehlungen' : 'Mood Matching',
          description: t('language') === 'de' ? 'Finde Bücher passend zu deiner Stimmung' : 'Find books matching your mood',
          icon: <Smile className="h-8 w-8 text-bookradar-primary" />,
          href: "/recommendations"
        },
        {
          title: t('language') === 'de' ? 'Buch-Quiz' : 'Book Quiz',
          description: t('language') === 'de' ? 'Teste dein Buchwissen' : 'Test your book knowledge',
          icon: <QuizIcon className="h-8 w-8 text-bookradar-primary" />,
          href: "/quiz"
        },
        {
          title: t('language') === 'de' ? 'Lesestatistiken' : 'Reading Statistics',
          description: t('language') === 'de' ? 'Verfolge deinen Lesefortschritt' : 'Track your reading progress',
          icon: <Star className="h-8 w-8 text-bookradar-primary" />,
          href: "/statistics"
        },
        {
          title: t('language') === 'de' ? 'Buch-Kalender' : 'Book Calendar',
          description: t('language') === 'de' ? 'Entdecke neue Bücher jeden Tag' : 'Discover new books every day',
          icon: <Calendar className="h-8 w-8 text-bookradar-primary" />,
          href: "/calendar"
        }
      ].map((feature, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-primary/10 p-3">
              {feature.icon}
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
            <Button 
              variant="outline" 
              className="mt-2 w-full" 
              onClick={() => navigate(feature.href)}
            >
              {t('explore')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Feature cards */}
        <div className="px-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {renderFeatureCards()}
        </div>

        {/* Main content with better spacing */}
        <div className="space-y-20 mt-10 px-4">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <BookOfTheDay />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {t('language') === 'de' ? 'Buchempfehlungen' : 'Book Recommendations'}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshCollections} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>{t('language') === 'de' ? 'Aktualisieren' : 'Refresh'}</span>
              </Button>
            </div>
            
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
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-muted rounded-lg mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderBookGrid(recommendedBooks.length > 0 ? recommendedBooks : sampleRecommendedBooks)
                )}
              </TabsContent>
              
              <TabsContent value="recent" className="pt-4">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-muted rounded-lg mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderBookGrid(recentBooks.length > 0 ? recentBooks : sampleRecentBooks)
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
