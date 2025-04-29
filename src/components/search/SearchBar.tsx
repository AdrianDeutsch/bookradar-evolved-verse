
import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { searchBooks, SearchResult } from '@/services/bookService';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery = '' }: SearchBarProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchBooks({ query: debouncedQuery, limit: 5 });
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    // Hide suggestions when clicking outside
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    setQuery(suggestion.title);
    onSearch(suggestion.title);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={handleInputChange}
            className="pl-10 pr-10 py-6 w-full"
            aria-label={t('search')}
            onFocus={() => setShowSuggestions(query.length >= 2)}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleClear}
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      
      {showSuggestions && (
        <div className="absolute z-10 w-full bg-popover shadow-lg rounded-md mt-1 overflow-hidden">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">
              {t('loading')}...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-[300px] overflow-auto">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    className="flex items-center gap-3 w-full text-left p-3 hover:bg-accent transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.coverUrl ? (
                      <img 
                        src={suggestion.coverUrl} 
                        alt={suggestion.title} 
                        className="h-10 w-8 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-8 bg-muted flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium line-clamp-1">{suggestion.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{suggestion.author}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-3 text-sm text-muted-foreground">
              {t('language') === 'de' 
                ? 'Keine Vorschläge gefunden' 
                : 'No suggestions found'}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
