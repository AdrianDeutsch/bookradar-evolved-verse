import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { searchBooks, SearchResult } from '@/services/bookService';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery = '' }: SearchBarProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionsFocusIndex, setSuggestionsFocusIndex] = useState(-1);
  const [hasError, setHasError] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setHasError(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      
      try {
        const results = await searchBooks({ query: debouncedQuery, limit: 5 });
        
        // Sort results for better relevance
        const sortedResults = [...results].sort((a, b) => {
          // Exact match at start gets highest priority
          const aStartsWithQuery = a.title.toLowerCase().startsWith(debouncedQuery.toLowerCase());
          const bStartsWithQuery = b.title.toLowerCase().startsWith(debouncedQuery.toLowerCase());
          
          if (aStartsWithQuery && !bStartsWithQuery) return -1;
          if (!aStartsWithQuery && bStartsWithQuery) return 1;
          
          // Contains query gets next priority
          const aContainsQuery = a.title.toLowerCase().includes(debouncedQuery.toLowerCase());
          const bContainsQuery = b.title.toLowerCase().includes(debouncedQuery.toLowerCase());
          
          if (aContainsQuery && !bContainsQuery) return -1;
          if (!aContainsQuery && bContainsQuery) return 1;
          
          // Finally sort by title length (shorter titles first)
          return a.title.length - b.title.length;
        });
        
        setSuggestions(sortedResults);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setHasError(true);
        toast({
          title: t('language') === 'de' ? 'Suchfehler' : 'Search Error',
          description: t('language') === 'de' 
            ? 'Es gab ein Problem bei der Suche. Bitte versuche es später erneut.' 
            : 'There was an issue with your search. Please try again later.',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedQuery) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setHasError(false);
    }
  }, [debouncedQuery, t, toast]);

  useEffect(() => {
    // Hide suggestions when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    // Set up key navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;
      
      // Arrow down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionsFocusIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      }
      
      // Arrow up
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionsFocusIndex(prev => prev > 0 ? prev - 1 : 0);
      }
      
      // Enter to select
      if (e.key === 'Enter' && suggestionsFocusIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[suggestionsFocusIndex]);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSuggestions, suggestions, suggestionsFocusIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
    // Reset focus index when input changes
    setSuggestionsFocusIndex(-1);
    if (hasError) setHasError(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
    setSuggestionsFocusIndex(-1);
    setHasError(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    setQuery(suggestion.title);
    onSearch(suggestion.title);
    setShowSuggestions(false);
    setSuggestionsFocusIndex(-1);
  };

  const handleRetry = () => {
    if (debouncedQuery.length >= 2) {
      setHasError(false);
      onSearch(query);
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={handleInputChange}
            className={`pl-10 pr-10 py-6 w-full ${hasError ? 'border-red-500' : ''}`}
            aria-label={t('search')}
            onFocus={() => {
              if (query.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={(e) => {
              // Handle enter key when no suggestion is focused
              if (e.key === 'Enter' && suggestionsFocusIndex === -1) {
                handleSubmit(e);
              }
              // Handle escape key to close suggestions
              if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
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
        <div className="absolute z-50 w-full bg-popover shadow-lg rounded-md mt-1 overflow-hidden">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">
              {t('loading')}...
            </div>
          ) : hasError ? (
            <div className="p-3 text-sm text-red-500">
              <div className="mb-1">
                {t('language') === 'de' 
                  ? 'Fehler bei der Suche' 
                  : 'Error fetching suggestions'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry} 
                className="w-full"
              >
                {t('language') === 'de' ? 'Erneut versuchen' : 'Try again'}
              </Button>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-[300px] overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <button
                    className={`flex items-center gap-3 w-full text-left p-3 hover:bg-accent transition-colors ${
                      index === suggestionsFocusIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSuggestionsFocusIndex(index)}
                  >
                    {suggestion.coverUrl ? (
                      <img 
                        src={suggestion.coverUrl} 
                        alt={suggestion.title} 
                        className="h-10 w-8 object-cover"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
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
