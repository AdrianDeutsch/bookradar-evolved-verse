
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import BookCard from '@/components/books/BookCard';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number;
  lastOpened?: Date;
  progress?: number;
}

const Library = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState('all');
  
  // Sample library data - in a production app this would come from an API or local storage
  const [books, setBooks] = useState<LibraryBook[]>([
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverUrl: 'https://covers.openlibrary.org/b/id/8152547-M.jpg',
      rating: 4.2,
      progress: 72
    },
    {
      id: '2',
      title: '1984',
      author: 'George Orwell',
      coverUrl: 'https://covers.openlibrary.org/b/id/8575241-M.jpg',
      rating: 4.6,
      progress: 15
    },
    {
      id: '3',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      coverUrl: 'https://covers.openlibrary.org/b/id/12008442-M.jpg',
      rating: 4.8,
      progress: 100
    }
  ]);

  const [filteredBooks, setFilteredBooks] = useState<LibraryBook[]>(books);

  // Filter books based on search term and active tab
  useEffect(() => {
    let results = books;
    
    // Apply search filter
    if (debouncedSearchTerm) {
      results = results.filter(book => 
        book.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
        book.author.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (activeTab === 'reading') {
      results = results.filter(book => book.progress && book.progress < 100);
    } else if (activeTab === 'completed') {
      results = results.filter(book => book.progress && book.progress === 100);
    }
    
    setFilteredBooks(results);
  }, [debouncedSearchTerm, books, activeTab]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('library')}</h1>
          <p className="text-muted-foreground">
            {t('language') === 'de'
              ? 'Verwalte deine Bücher und deinen Lesefortschritt'
              : 'Manage your books and reading progress'}
          </p>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">{t('allBooks')}</TabsTrigger>
            <TabsTrigger value="reading">{t('language') === 'de' ? 'Lesend' : 'Reading'}</TabsTrigger>
            <TabsTrigger value="completed">{t('language') === 'de' ? 'Abgeschlossen' : 'Completed'}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
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
            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t('language') === 'de' 
                    ? 'Keine Bücher gefunden' 
                    : 'No books found'}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reading" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
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
            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t('language') === 'de' 
                    ? 'Keine Bücher, die du gerade liest' 
                    : 'No books currently being read'}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
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
            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t('language') === 'de' 
                    ? 'Keine abgeschlossenen Bücher' 
                    : 'No completed books'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Library;
