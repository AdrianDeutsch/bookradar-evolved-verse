
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { SearchResult, searchBooks } from '@/services/bookService';
import SearchBar from '@/components/search/SearchBar';
import BookCard from '@/components/books/BookCard';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Search = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBooks = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const books = await searchBooks({ query, limit: 20 });
        setResults(books);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [query]);

  // Sort and filter results
  const processedResults = [...results]
    .filter(book => {
      if (filter === 'all') return true;
      if (filter === 'with-cover' && book.coverUrl) return true;
      if (filter === 'recent' && book.publishYear && book.publishYear > 2000) return true;
      return false;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'year' && a.publishYear && b.publishYear) return b.publishYear - a.publishYear;
      return 0; // Default: relevance (API order)
    });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{t('search')}</h1>
          <p className="text-muted-foreground">
            {t('language') === 'de' 
              ? 'Durchsuche unsere umfangreiche Bibliothek an Büchern'
              : 'Search our extensive library of books'}
          </p>
          
          <div className="max-w-3xl">
            <SearchBar onSearch={handleSearch} />
          </div>

          {query && (
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('sortBy')}:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t('relevance')}</SelectItem>
                    <SelectItem value="title">{t('title')}</SelectItem>
                    <SelectItem value="author">{t('author')}</SelectItem>
                    <SelectItem value="year">{t('year')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('filter')}:</span>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('filter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allBooks')}</SelectItem>
                    <SelectItem value="with-cover">{t('withCover')}</SelectItem>
                    <SelectItem value="recent">{t('recentBooks')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {query && (
              <p className="text-sm text-muted-foreground">
                {processedResults.length} {t('resultsFound')}
              </p>
            )}
            
            {processedResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {processedResults.map((book) => (
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
            ) : query ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  {t('language') === 'de'
                    ? 'Keine Ergebnisse gefunden. Versuche es mit einem anderen Suchbegriff.'
                    : 'No results found. Try a different search term.'}
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
