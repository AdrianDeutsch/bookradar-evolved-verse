
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const workResponse = await fetch(`https://openlibrary.org/works/${id}.json`, { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
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
      coverUrl = createPlaceholderImage(work.title || 'Book');
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`, { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Book not found');
    
    const book: GoogleBook = await response.json();
    const { volumeInfo } = book;

    // Try multiple cover options with fallbacks
    const coverUrl = volumeInfo.imageLinks?.large || 
                    volumeInfo.imageLinks?.medium || 
                    volumeInfo.imageLinks?.small || 
                    volumeInfo.imageLinks?.thumbnail || 
                    createPlaceholderImage(volumeInfo.title || 'Book');
                    
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
  // Return values from partial successful data
  let partialResult: Partial<SearchResult> = {
    id
  };
  
  try {
    // Try OpenLibrary first
    try {
      return await getOpenLibraryBookDetails(id);
    } catch (error) {
      console.log('OpenLibrary fetch failed, trying Google Books');
      // Continue with partial data if we have any
      if (error instanceof Error && error.message !== 'Work not found') {
        // Preserve any partial data we might have
      }
    }
    
    // Try Google Books
    try {
      // If we have an OL ID, convert it to a search term for Google Books
      if (id.startsWith('OL')) {
        // Try to extract title or author from the ID or use general search
        const searchParam = id.replace(/OL|W/g, '').replace(/\d+/g, ' book ').trim();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const searchResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchParam)}&maxResults=1`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
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
      
      throw new Error('Google Books search failed');
    } catch (error) {
      console.log('Google Books fetch failed');
      
      // Try to incorporate any partial data we gathered
      if (Object.keys(partialResult).length > 1) {
        const placeholderUrl = createPlaceholderImage(partialResult.title || 'Book');
        return {
          id,
          title: partialResult.title || 'Book Information',
          author: partialResult.author || 'Unknown Author',
          description: partialResult.description || 'Book information could not be fully retrieved.',
          cover: partialResult.cover || placeholderUrl,
          coverUrl: partialResult.coverUrl || placeholderUrl,
          publishYear: partialResult.publishYear || null
        };
      }
    }
    
    // Last resort fallback with improved visuals
    let title = 'Book Information';
    let author = 'Unknown Author';
    let placeholderImage = createPlaceholderImage('Book');
    
    // Try to extract meaningful info from the ID
    if (id.startsWith('OL')) {
      title = `Open Library Book`;
      author = 'Unknown Author';
    }
    
    return {
      id,
      title,
      author,
      description: 'Details for this book are currently unavailable. Please try again later.',
      cover: placeholderImage,
      coverUrl: placeholderImage,
      publishYear: null
    };
  } catch (error) {
    console.error('All API attempts failed:', error);
    
    // Return a user-friendly fallback object
    const placeholderUrl = createPlaceholderImage('Book');
    return {
      id,
      title: 'Book Information',
      author: 'Unknown Author',
      description: 'Details for this book are currently unavailable. Please try again later.',
      cover: placeholderUrl,
      coverUrl: placeholderUrl,
      publishYear: null
    };
  }
}

// Enhanced placeholder image creator with better aesthetics
export function createPlaceholderImage(title: string = 'Book', author: string = ''): string {
  // Generate a soft, readable background color based on title
  const getColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Use pastel colors for better aesthetics
    const hue = ((hash & 0xFFFFFF) % 360);
    return `hsl(${hue}, 70%, 80%)`;
  };
  
  const bgColor = getColorFromString(title);
  const text = author ? `${title} by ${author}` : title;
  
  // Try to use a more visually appealing placeholder
  try {
    // First attempt to use a nicer placeholder service
    return `https://placehold.co/300x450/${bgColor.replace('#', '')}/333333?text=${encodeURIComponent(text.substring(0, 30))}`;
  } catch (error) {
    // Fallback to via.placeholder
    return `https://via.placeholder.com/300x450/${bgColor.replace('#', '')}/333333?text=${encodeURIComponent(text.substring(0, 30))}`;
  }
}
