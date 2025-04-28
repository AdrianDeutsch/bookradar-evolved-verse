
import { SearchResult } from './bookService';

interface OpenLibraryWork {
  key: string;
  title: string;
  description?: string;
  covers?: number[];
  first_publish_date?: string;
  authors?: Array<{ author: { key: string } }>;
}

interface OpenLibraryAuthor {
  name: string;
  birth_date?: string;
  bio?: string;
}

export async function getOpenLibraryBookDetails(id: string) {
  try {
    // First get the work details
    const workResponse = await fetch(`https://openlibrary.org/works/${id}.json`);
    if (!workResponse.ok) throw new Error('Work not found');
    const work: OpenLibraryWork = await workResponse.json();

    // Get author details if available
    let authorName = 'Unknown Author';
    if (work.authors?.[0]) {
      try {
        const authorKey = work.authors[0].author.key;
        const authorResponse = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (authorResponse.ok) {
          const authorData: OpenLibraryAuthor = await authorResponse.json();
          authorName = authorData.name;
        }
      } catch (error) {
        console.log('Failed to fetch author details, using default');
      }
    }

    // Handle covers, with fallback
    let coverUrl = null;
    if (work.covers && work.covers.length > 0) {
      coverUrl = `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`;
      
      // Check if the cover image actually exists
      try {
        const coverCheck = await fetch(coverUrl, { method: 'HEAD' });
        if (!coverCheck.ok) {
          coverUrl = null;
        }
      } catch (error) {
        console.log('Cover image check failed, using fallback');
        coverUrl = null;
      }
    }

    // If no cover, try to fetch from other sources or use default
    if (!coverUrl) {
      coverUrl = `https://via.placeholder.com/300x450?text=${encodeURIComponent(work.title || 'Book')}`;
    }

    return {
      id,
      title: work.title || 'Unknown Title',
      author: authorName,
      description: work.description?.toString() || 'No description available',
      cover: coverUrl,
      coverUrl: coverUrl,
      publishYear: work.first_publish_date ? parseInt(work.first_publish_date.slice(0, 4)) : null,
    };
  } catch (error) {
    console.error('Error fetching from OpenLibrary:', error);
    throw error;
  }
}

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
  };
}

export async function getGoogleBookDetails(id: string): Promise<SearchResult> {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    if (!response.ok) throw new Error('Book not found');
    
    const book: GoogleBook = await response.json();
    const { volumeInfo } = book;

    // Try multiple cover options with fallbacks
    const coverUrl = volumeInfo.imageLinks?.large || 
                    volumeInfo.imageLinks?.medium || 
                    volumeInfo.imageLinks?.small || 
                    volumeInfo.imageLinks?.thumbnail || 
                    `https://via.placeholder.com/300x450?text=${encodeURIComponent(volumeInfo.title || 'Book')}`;
                    
    return {
      id: book.id,
      title: volumeInfo.title || 'Unknown Title',
      author: volumeInfo.authors?.[0] || 'Unknown Author',
      description: volumeInfo.description || 'No description available',
      cover: coverUrl,
      coverUrl: coverUrl,
      publishYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.slice(0, 4)) : null,
    };
  } catch (error) {
    console.error('Error fetching from Google Books:', error);
    throw error;
  }
}

// Improved function to try getting book details from multiple sources with better error handling
export async function tryMultipleApiSources(id: string): Promise<SearchResult> {
  // Track failed attempts
  const failedApis = {
    openLibrary: false,
    googleBooks: false
  };
  
  try {
    // Try OpenLibrary first
    try {
      return await getOpenLibraryBookDetails(id);
    } catch (error) {
      console.log('OpenLibrary fetch failed, trying Google Books');
      failedApis.openLibrary = true;
      // Fall through to next API
    }
    
    // Try Google Books
    try {
      // If we have an OL ID, convert it to a search term for Google Books
      if (id.startsWith('OL') && failedApis.openLibrary) {
        // Try to extract title or author from the ID or use general search
        const searchParam = id.replace(/OL|W/g, '').replace(/\d+/g, ' book ').trim();
        const searchResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchParam)}&maxResults=1`);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.items && searchData.items.length > 0) {
            return await getGoogleBookDetails(searchData.items[0].id);
          }
        }
      } else if (!id.startsWith('OL')) {
        // Direct Google Books ID
        return await getGoogleBookDetails(id);
      }
      
      failedApis.googleBooks = true;
      throw new Error('Google Books search failed');
    } catch (error) {
      console.log('Google Books fetch failed');
      // Fall through to fallback
    }
    
    // If we reach here, both APIs failed
    // Last resort fallback (create a clean placeholder with the ID info)
    let title = 'Book Information Unavailable';
    let placeholderImage = '/placeholder.svg';
    
    // Try to extract meaningful info from the ID
    if (id.startsWith('OL')) {
      title = `Open Library Book (ID: ${id})`;
      placeholderImage = `https://via.placeholder.com/300x450?text=${encodeURIComponent('Open Library Book')}`;
    } else {
      title = `Book (ID: ${id})`;
    }
    
    return {
      id,
      title,
      author: 'Unknown',
      description: 'We could not retrieve information for this book at this time. Please try again later.',
      cover: placeholderImage,
      coverUrl: placeholderImage,
      publishYear: null
    };
  } catch (error) {
    console.error('All API attempts failed:', error);
    
    // Return a graceful fallback object
    return {
      id,
      title: 'Book Information Unavailable',
      author: 'Unknown',
      description: 'We could not retrieve information for this book at this time. Please try again later.',
      cover: '/placeholder.svg',
      coverUrl: '/placeholder.svg',
      publishYear: null
    };
  }
}

// New helper function for creating a nice placeholder image
export function createPlaceholderImage(title: string = 'Book', author: string = ''): string {
  const text = author ? `${title} by ${author}` : title;
  return `https://via.placeholder.com/300x450?text=${encodeURIComponent(text.substring(0, 30))}`;
}
