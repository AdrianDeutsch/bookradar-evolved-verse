
import { getOpenLibraryBookDetails, getGoogleBookDetails, tryMultipleApiSources, createPlaceholderImage } from './bookApi';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  cover: string | null;  // Adding the 'cover' property for compatibility
  publishYear?: number;
  description?: string | null;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  filter?: string;
}

/**
 * Search for books using the OpenLibrary API with fallback to Google Books API
 * Improved error handling, multiple API sources, and quality filtering
 */
export const searchBooks = async ({ query, limit = 10, page = 1, sortBy = "relevance", filter = "" }: SearchOptions): Promise<SearchResult[]> => {
  if (!query.trim()) {
    return [];
  }
  
  try {
    let apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit * 2}&page=${page}`;
    // We request more books than needed to account for filtering
    
    // Add sorting if specified
    if (sortBy === 'title') {
      apiUrl += '&sort=title';
    } else if (sortBy === 'author') {
      apiUrl += '&sort=author';
    } else if (sortBy === 'year') {
      apiUrl += '&sort=old';
    }
    
    // Add filter for books with covers if specified
    if (filter === 'withCover') {
      apiUrl += '&has_fulltext=true';
    }
    
    // Try OpenLibrary API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`OpenLibrary API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have results
      if (!data.docs || data.docs.length === 0) {
        return searchGoogleBooks({ query, limit, page });
      }
      
      // Filter books to ensure they have all required fields
      const filteredResults = data.docs
        .filter((doc: OpenLibraryDoc) => {
          // Only include books with required fields
          return (
            doc.title && // Must have title
            doc.author_name && doc.author_name.length > 0 && // Must have author
            doc.cover_i // Must have cover
          );
        })
        .map((doc: OpenLibraryDoc) => {
          const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          
          return {
            id: doc.key.replace('/works/', ''),
            title: doc.title,
            author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
            coverUrl: coverUrl,
            cover: coverUrl,
            publishYear: doc.first_publish_year,
            description: null
          };
        });
      
      // If filtering left us with too few results, use fallback API
      if (filteredResults.length < Math.min(5, limit)) {
        console.log('Too few results after filtering from OpenLibrary, trying Google Books API');
        const googleResults = await searchGoogleBooks({ query, limit, page });
        return googleResults;
      }
      
      // Return only the requested number of results
      return filteredResults.slice(0, limit);
      
    } catch (error) {
      // Network error, timeout, or API error
      console.error('Error with OpenLibrary API:', error);
      return searchGoogleBooks({ query, limit, page });
    }
  } catch (error) {
    console.error('Error searching books on OpenLibrary:', error);
    // Fallback to Google Books API
    return searchGoogleBooks({ query, limit, page });
  }
}

/**
 * Fallback function to search books using Google Books API
 * With enhanced error handling and quality filtering
 */
const searchGoogleBooks = async ({ query, limit = 10, page = 1 }: SearchOptions): Promise<SearchResult[]> => {
  try {
    // Google Books API uses startIndex instead of page
    const startIndex = (page - 1) * limit;
    
    // Request more books than needed to account for filtering
    const requestLimit = limit * 2;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${requestLimit}&startIndex=${startIndex}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Error with Google Books API:', response.status);
        return createPlaceholderResults(query, limit);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return createPlaceholderResults(query, limit);
      }
      
      // Filter books to ensure they have all required fields
      const filteredResults = data.items
        .filter((item: any) => {
          const volumeInfo = item.volumeInfo;
          return (
            volumeInfo.title && // Must have title
            volumeInfo.authors && volumeInfo.authors.length > 0 && // Must have author
            volumeInfo.imageLinks && // Must have image links
            (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail) // Must have at least one image URL
          );
        })
        .map((item: any) => {
          const volumeInfo = item.volumeInfo;
          
          const coverUrl = volumeInfo.imageLinks ? 
            (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail) : 
            null; // This shouldn't happen due to filter, but just in case
          
          return {
            id: item.id,
            title: volumeInfo.title,
            author: volumeInfo.authors[0],
            coverUrl: coverUrl,
            cover: coverUrl,
            publishYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : undefined,
            description: volumeInfo.description || null
          };
        });
      
      // If we have enough filtered results, return them
      if (filteredResults.length >= Math.min(3, limit)) {
        return filteredResults.slice(0, limit);
      } else {
        // If we don't have enough results, create some placeholders
        return createPlaceholderResults(query, limit);
      }
    } catch (error) {
      // If fetch times out or fails
      console.error('Network error with Google Books API:', error);
      return createPlaceholderResults(query, limit);
    }
  } catch (error) {
    console.error('Error searching books on Google Books:', error);
    return createPlaceholderResults(query, limit);
  }
}

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
      description: 'This is a placeholder result. Try refining your search or check your internet connection.'
    });
  }
  
  return results;
}

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
 * Fetch "book of the day" from OpenLibrary with improved fallback and quality filtering
 */
export const fetchBookOfTheDay = async (): Promise<SearchResult | null> => {
  // For the book of the day, we'll get a random book from a curated list
  // In a real implementation, this might come from a specialized endpoint
  const popularTopics = ["fiction", "fantasy", "science", "classics", "biography"];
  const randomTopic = popularTopics[Math.floor(Math.random() * popularTopics.length)];
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${randomTopic}&limit=20`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return fallbackBookOfTheDay();
      }
      
      const data = await response.json();
      
      if (!data.docs || data.docs.length === 0) {
        return fallbackBookOfTheDay();
      }
      
      // Pick a random book from the results that has a valid cover, title, and author
      let randomBooks = data.docs.filter((book: any) => 
        book.cover_i && 
        book.title && 
        book.author_name && 
        book.author_name.length > 0
      );
      
      // If no books with sufficient data, use fallback
      if (randomBooks.length === 0) {
        return fallbackBookOfTheDay();
      }
      
      const randomIndex = Math.floor(Math.random() * randomBooks.length);
      const randomBook = randomBooks[randomIndex];
      
      const coverUrl = `https://covers.openlibrary.org/b/id/${randomBook.cover_i}-M.jpg`;
      
      return {
        id: randomBook.key.replace('/works/', ''),
        title: randomBook.title,
        author: randomBook.author_name[0],
        coverUrl: coverUrl,
        cover: coverUrl,
        publishYear: randomBook.first_publish_year,
        description: null
      };
    } catch (error) {
      console.error('Network error with Book of the Day:', error);
      return fallbackBookOfTheDay();
    }
  } catch (error) {
    console.error('Error fetching book of the day:', error);
    return fallbackBookOfTheDay();
  }
}

/**
 * Fallback for book of the day with improved error handling and quality filtering
 */
const fallbackBookOfTheDay = async (): Promise<SearchResult | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(
        "https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=40",
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return defaultBookOfTheDay();
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return defaultBookOfTheDay();
      }
      
      // Filter to only include books with all required fields
      const booksWithCompleteData = data.items.filter(
        (item: any) => {
          const volumeInfo = item.volumeInfo;
          return (
            volumeInfo && 
            volumeInfo.title && 
            volumeInfo.authors && 
            volumeInfo.authors.length > 0 && 
            volumeInfo.imageLinks &&
            (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail)
          );
        }
      );
      
      // Use filtered books if available, otherwise fall back to default
      const books = booksWithCompleteData.length > 0 ? booksWithCompleteData : data.items;
      
      if (books.length === 0) {
        return defaultBookOfTheDay();
      }
      
      const randomIndex = Math.floor(Math.random() * books.length);
      const randomBook = books[randomIndex].volumeInfo;
      
      const coverUrl = randomBook.imageLinks ? 
        randomBook.imageLinks.thumbnail : 
        null; // Should not be null due to our filtering
      
      if (!coverUrl) {
        return defaultBookOfTheDay();
      }
      
      return {
        id: data.items[randomIndex].id,
        title: randomBook.title,
        author: randomBook.authors[0],
        coverUrl: coverUrl,
        cover: coverUrl,
        publishYear: randomBook.publishedDate ? parseInt(randomBook.publishedDate.substring(0, 4)) : undefined,
        description: randomBook.description || null
      };
    } catch (error) {
      console.error('Network error with fallback book of the day:', error);
      return defaultBookOfTheDay();
    }
  } catch (error) {
    console.error('Error with fallback book of the day:', error);
    return defaultBookOfTheDay();
  }
}

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
    description: 'Discover a new book each day with BookRadar!'
  };
};
