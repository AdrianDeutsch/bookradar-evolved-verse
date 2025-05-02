import { getOpenLibraryBookDetails, getGoogleBookDetails, tryMultipleApiSources, createPlaceholderImage } from './bookApi';
import { searchOpenLibrary, fetchOpenLibraryBookOfTheDay } from './apis/openLibraryApi';
import { searchGoogleBooks, fetchGoogleBookOfTheDay } from './apis/googleBooksApi';
import { useToast } from '@/hooks/use-toast';

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  cover: string | null;
  publishYear?: number | null;
  description?: string | null;
  authorBio?: string | null;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  filter?: string;
}

/**
 * Search for books using multiple API sources with fallback
 */
export const searchBooks = async (options: SearchOptions): Promise<SearchResult[]> => {
  if (!options.query.trim()) {
    return [];
  }
  
  // Try OpenLibrary API first
  try {
    const results = await searchOpenLibrary(options);
    
    // If we have results, return them
    if (results.length > 0) {
      return results;
    }
    
    // Otherwise fall back to Google Books
    return await searchGoogleBooks(options);
  } catch (error) {
    console.error('Error searching books on OpenLibrary:', error);
    
    // Fallback to Google Books API
    try {
      return await searchGoogleBooks(options);
    } catch (googleError) {
      console.error('Error searching books on Google Books:', googleError);
      return createPlaceholderResults(options.query, options.limit || 3);
    }
  }
};

/**
 * Create placeholder results when all APIs fail
 */
const createPlaceholderResults = (query: string, count: number = 3): SearchResult[] => {
  const results: SearchResult[] = [];
  
  for (let i = 0; i < count; i++) {
    results.push({
      id: `placeholder-${i}`,
      title: `Search result for "${query}"`,
      author: 'Unknown Author',
      coverUrl: createPlaceholderImage(`Result ${i+1} for "${query}"`),
      cover: createPlaceholderImage(`Result ${i+1} for "${query}"`),
      publishYear: new Date().getFullYear(),
      description: 'This is a placeholder result. Try refining your search or check your internet connection.',
      authorBio: null
    });
  }
  
  return results;
};

/**
 * Get detailed book information with improved fallback
 */
export const getBookDetails = async (bookId: string) => {
  if (!bookId) {
    throw new Error('Book ID is required');
  }
  
  try {
    return await tryMultipleApiSources(bookId);
  } catch (error) {
    console.error('All APIs failed:', error);
    throw error;
  }
};

/**
 * Fetch "book of the day" with fallback mechanism
 */
export const fetchBookOfTheDay = async (): Promise<SearchResult | null> => {
  try {
    // Try OpenLibrary first
    const openLibraryBook = await fetchOpenLibraryBookOfTheDay();
    if (openLibraryBook) {
      return openLibraryBook;
    }
    
    // Try Google Books if OpenLibrary fails
    const googleBook = await fetchGoogleBookOfTheDay();
    if (googleBook) {
      return googleBook;
    }
    
    // If all else fails, return default book
    return defaultBookOfTheDay();
  } catch (error) {
    console.error('Error fetching book of the day:', error);
    return defaultBookOfTheDay();
  }
};

/**
 * Default book of the day when all else fails
 */
const defaultBookOfTheDay = (): SearchResult => {
  return {
    id: 'default',
    title: 'Book of the Day',
    author: 'BookRadar Selection',
    coverUrl: '/placeholder.svg',
    cover: '/placeholder.svg', 
    publishYear: new Date().getFullYear(),
    description: 'Discover a new book each day with BookRadar!',
    authorBio: null
  };
};
