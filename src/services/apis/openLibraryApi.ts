
import { createPlaceholderImage } from '../bookApi';
import { SearchOptions, SearchResult } from '../bookService';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
}

/**
 * Search for books using the OpenLibrary API
 */
export const searchOpenLibrary = async ({ query, limit = 10, page = 1, sortBy = "relevance", filter = "" }: SearchOptions): Promise<SearchResult[]> => {
  try {
    let apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;
    
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
    
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`OpenLibrary API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.docs || data.docs.length === 0) {
      return [];
    }
    
    return data.docs.map((doc: OpenLibraryDoc) => {
      const coverUrl = doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
        : createPlaceholderImage(doc.title, doc.author_name ? doc.author_name[0] : undefined);
      
      return {
        id: doc.key.replace('/works/', ''),
        title: doc.title || 'Unknown Title',
        author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
        coverUrl: coverUrl,
        cover: coverUrl,
        publishYear: doc.first_publish_year,
        description: null,
        authorBio: null
      };
    });
  } catch (error) {
    console.error('Error searching books on OpenLibrary:', error);
    return [];
  }
};

/**
 * Fetch "book of the day" from OpenLibrary
 */
export const fetchOpenLibraryBookOfTheDay = async (): Promise<SearchResult | null> => {
  // For the book of the day, we'll get a random book from a curated list
  const popularTopics = ["fiction", "fantasy", "science", "classics", "biography"];
  const randomTopic = popularTopics[Math.floor(Math.random() * popularTopics.length)];
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${randomTopic}&limit=20`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.docs || data.docs.length === 0) {
      return null;
    }
    
    // Pick a random book from the results that has a cover
    let randomBooks = data.docs.filter((book: any) => book.cover_i);
    
    // If no books with covers, use all results
    if (randomBooks.length === 0) {
      randomBooks = data.docs;
    }
    
    const randomIndex = Math.floor(Math.random() * randomBooks.length);
    const randomBook = randomBooks[randomIndex];
    
    const coverUrl = randomBook.cover_i 
      ? `https://covers.openlibrary.org/b/id/${randomBook.cover_i}-M.jpg` 
      : createPlaceholderImage(randomBook.title, randomBook.author_name ? randomBook.author_name[0] : undefined);
    
    return {
      id: randomBook.key.replace('/works/', ''),
      title: randomBook.title || 'Book of the Day',
      author: randomBook.author_name ? randomBook.author_name[0] : 'Unknown Author',
      coverUrl: coverUrl,
      cover: coverUrl,
      publishYear: randomBook.first_publish_year,
      description: null,
      authorBio: null
    };
  } catch (error) {
    console.error('Network error with Book of the Day:', error);
    return null;
  }
};
