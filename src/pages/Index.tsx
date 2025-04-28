
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import BookOfTheDay from '@/components/books/BookOfTheDay';
import BookCard from '@/components/books/BookCard';
import SearchBar from '@/components/search/SearchBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book } from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample data - in a real app, this would come from an API
  const recentBooks = [
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

  const recommendedBooks = [
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, we would perform a search request here
    console.log('Searching for:', query);
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* App header with centered logo */}
        <div className="flex flex-col items-center space-y-4 pt-8 md:pt-10 max-w-4xl mx-auto">
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
        <div className="max-w-2xl mx-auto px-4 animate-fade-in">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Main content with better spacing */}
        <div className="space-y-16 mt-8 px-4">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <BookOfTheDay />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Tabs defaultValue="recommended">
              <TabsList className="mx-auto flex justify-center mb-6">
                <TabsTrigger value="recommended">Empfehlungen</TabsTrigger>
                <TabsTrigger value="recent">Kürzlich hinzugefügt</TabsTrigger>
              </TabsList>
              <TabsContent value="recommended" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recommendedBooks.map(book => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.coverUrl}
                      rating={book.rating}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="recent" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recentBooks.map(book => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.coverUrl}
                      rating={book.rating}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
