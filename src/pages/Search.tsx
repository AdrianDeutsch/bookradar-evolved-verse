
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { SearchResult, searchBooks } from '@/services/bookService';
import SearchBar from '@/components/search/SearchBar';
import BookCard from '@/components/books/BookCard';
import { Loader2, SlidersHorizontal, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Search = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filter, setFilter] = useState('all');
  const [yearRange, setYearRange] = useState<[number, number]>([1900, new Date().getFullYear()]);
  const [showWithCoverOnly, setShowWithCoverOnly] = useState(false);
  const [activeGenres, setActiveGenres] = useState<string[]>([]);

  const genres = [
    'fiction', 'non-fiction', 'science-fiction', 'fantasy', 
    'mystery', 'thriller', 'romance', 'biography', 
    'history', 'poetry', 'children', 'classic'
  ];

  useEffect(() => {
    if (initialQuery) {
      fetchBooks(initialQuery);
    }
  }, [initialQuery, sortBy, filter, showWithCoverOnly, yearRange, activeGenres]);

  const fetchBooks = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let books = await searchBooks({ 
        query: searchQuery,
        sortBy,
        limit: 40
      });

      // Apply client-side filtering
      if (showWithCoverOnly) {
        books = books.filter(book => book.coverUrl !== null);
      }
      
      if (yearRange && yearRange[0] !== 1900 || yearRange[1] !== new Date().getFullYear()) {
        books = books.filter(book => 
          book.publishYear && 
          book.publishYear >= yearRange[0] && 
          book.publishYear <= yearRange[1]
        );
      }
      
      if (activeGenres.length > 0) {
        // This is a simplification - in reality you'd need better genre matching
        books = books.filter(book => {
          const description = book.description?.toLowerCase() || '';
          const title = book.title.toLowerCase();
          return activeGenres.some(genre => 
            description.includes(genre) || title.includes(genre)
          );
        });
      }
      
      setResults(books);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
      setResults([]);
    }
  };

  const handleGenreToggle = (genre: string) => {
    if (activeGenres.includes(genre)) {
      setActiveGenres(activeGenres.filter(g => g !== genre));
    } else {
      setActiveGenres([...activeGenres, genre]);
    }
  };

  const clearFilters = () => {
    setSortBy('relevance');
    setFilter('all');
    setYearRange([1900, new Date().getFullYear()]);
    setShowWithCoverOnly(false);
    setActiveGenres([]);
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
            <SearchBar onSearch={handleSearch} initialQuery={query} />
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
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {language === 'de' ? 'Erweiterte Filter' : 'Advanced Filters'}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{language === 'de' ? 'Erweiterte Filter' : 'Advanced Filters'}</SheetTitle>
                    <SheetDescription>
                      {language === 'de' 
                        ? 'Verfeinere deine Suche mit diesen Optionen'
                        : 'Refine your search with these options'}
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">
                        {language === 'de' ? 'Erscheinungsjahr' : 'Publication Year'}
                      </h3>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>{yearRange[0]}</span>
                        <span>{yearRange[1]}</span>
                      </div>
                      <Slider
                        value={yearRange}
                        min={1800}
                        max={new Date().getFullYear()}
                        step={1}
                        onValueChange={(value) => setYearRange(value as [number, number])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="with-cover" 
                          checked={showWithCoverOnly} 
                          onCheckedChange={() => setShowWithCoverOnly(!showWithCoverOnly)}
                        />
                        <Label htmlFor="with-cover">
                          {language === 'de' ? 'Nur Bücher mit Cover' : 'Only books with cover'}
                        </Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">
                        {language === 'de' ? 'Genres' : 'Genres'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {genres.map(genre => (
                          <Badge 
                            key={genre}
                            variant={activeGenres.includes(genre) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleGenreToggle(genre)}
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      className="w-full mt-4"
                      onClick={clearFilters}
                    >
                      {language === 'de' ? 'Filter zurücksetzen' : 'Clear Filters'}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              {(activeGenres.length > 0 || 
                showWithCoverOnly || 
                yearRange[0] !== 1900 || 
                yearRange[1] !== new Date().getFullYear()) && (
                <div className="flex flex-wrap gap-1">
                  {activeGenres.map(genre => (
                    <Badge key={genre} variant="secondary" className="gap-1">
                      {genre}
                      <button 
                        className="ml-1 text-xs" 
                        onClick={() => handleGenreToggle(genre)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {showWithCoverOnly && (
                    <Badge variant="secondary" className="gap-1">
                      {language === 'de' ? 'Mit Cover' : 'With Cover'}
                      <button 
                        className="ml-1 text-xs" 
                        onClick={() => setShowWithCoverOnly(false)}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {(yearRange[0] !== 1900 || yearRange[1] !== new Date().getFullYear()) && (
                    <Badge variant="secondary" className="gap-1">
                      {yearRange[0]} - {yearRange[1]}
                      <button 
                        className="ml-1 text-xs" 
                        onClick={() => setYearRange([1900, new Date().getFullYear()])}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
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
              <Card className="text-center py-12">
                <CardHeader>
                  <div className="mx-auto rounded-full bg-muted p-3 w-12 h-12 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">
                    {language === 'de'
                      ? 'Keine Ergebnisse gefunden'
                      : 'No results found'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'de'
                      ? 'Versuche es mit einem anderen Suchbegriff oder andere Filter'
                      : 'Try a different search term or change your filters'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    {language === 'de' ? 'Filter zurücksetzen' : 'Clear filters'}
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
