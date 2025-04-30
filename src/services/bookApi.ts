
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
    let authorBio = null;
    if (work.authors?.[0]) {
      try {
        const authorKey = work.authors[0].author.key;
        const authorResponse = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (authorResponse.ok) {
          const authorData: OpenLibraryAuthor = await authorResponse.json();
          authorName = authorData.name;
          authorBio = authorData.bio;
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
      authorBio: authorBio,
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

// New function to get book details from Project Gutenberg API (via Gutendex)
export async function getGutendexBookDetails(query: string): Promise<SearchResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Use the Gutendex API to search for books
    const response = await fetch(
      `https://gutendex.com/books/?search=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Gutendex API error');
    
    const data = await response.json();
    
    // Check if we have results
    if (!data.results || data.results.length === 0) {
      return null;
    }
    
    // Get the first result
    const book = data.results[0];
    
    // Check for cover images
    let coverUrl = null;
    if (book.formats && book.formats['image/jpeg']) {
      coverUrl = book.formats['image/jpeg'];
    }
    
    // If no cover, use a placeholder
    if (!coverUrl) {
      coverUrl = createPlaceholderImage(book.title);
    }
    
    return {
      id: book.id.toString(),
      title: book.title || 'Unknown Title',
      author: book.authors?.length > 0 ? book.authors[0].name : 'Unknown Author',
      description: `A classic work available on Project Gutenberg. Written by ${book.authors?.length > 0 ? book.authors[0].name : 'an unknown author'}.`,
      cover: coverUrl,
      coverUrl: coverUrl,
      publishYear: book.copyright ? parseInt(book.copyright) : null,
    };
  } catch (error) {
    console.error('Error fetching from Gutendex:', error);
    return null;
  }
}

// Enhanced parallel fetching from multiple APIs
export async function fetchFromMultipleApis(id: string, title?: string, author?: string): Promise<SearchResult> {
  let partialData: Partial<SearchResult> = { id };
  const apiPromises = [];
  
  // Try to get data from OpenLibrary if we have an OL id
  if (id.startsWith('OL')) {
    apiPromises.push(getOpenLibraryBookDetails(id).catch(error => {
      console.log('OpenLibrary fetch failed:', error);
      return null;
    }));
  }
  
  // Try Google Books API
  apiPromises.push(getGoogleBookDetails(id).catch(error => {
    console.log('Google Books fetch failed:', error);
    return null;
  }));
  
  // If we have title and/or author, try Gutendex
  if (title || author) {
    const searchQuery = [title, author].filter(Boolean).join(' ');
    apiPromises.push(getGutendexBookDetails(searchQuery).catch(error => {
      console.log('Gutendex fetch failed:', error);
      return null;
    }));
  }
  
  // Wait for all APIs to respond
  const results = await Promise.all(apiPromises);
  
  // Filter out null responses
  const validResults = results.filter(result => result !== null) as SearchResult[];
  
  if (validResults.length > 0) {
    // Merge the data from all valid APIs, prioritizing more complete data
    return validResults.reduce((mergedBook, currentBook) => {
      return {
        id: mergedBook.id || currentBook.id,
        title: mergedBook.title || currentBook.title,
        author: mergedBook.author || currentBook.author,
        description: mergedBook.description || currentBook.description,
        cover: mergedBook.cover || currentBook.cover,
        coverUrl: mergedBook.coverUrl || currentBook.coverUrl,
        publishYear: mergedBook.publishYear || currentBook.publishYear,
        authorBio: mergedBook.authorBio || currentBook.authorBio,
      };
    });
  }
  
  // If all APIs failed, try a last-resort search with title/author
  if ((title || author) && !id.includes(' ')) {
    try {
      const searchQuery = [title, author, 'book'].filter(Boolean).join(' ');
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.docs && data.docs.length > 0) {
          const book = data.docs[0];
          const coverUrl = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` 
            : createPlaceholderImage(book.title || 'Book');
          
          return {
            id,
            title: book.title || title || 'Unknown Title',
            author: book.author_name ? book.author_name[0] : author || 'Unknown Author',
            description: 'No detailed description available for this book.',
            cover: coverUrl,
            coverUrl: coverUrl,
            publishYear: book.first_publish_year,
          };
        }
      }
    } catch (error) {
      console.error('Last resort search failed:', error);
    }
  }
  
  // Create a placeholder with any partial data we might have
  return {
    id,
    title: title || 'Book Information',
    author: author || 'Unknown Author',
    description: 'Details for this book are currently unavailable. Please try again later.',
    cover: createPlaceholderImage(title || 'Book'),
    coverUrl: createPlaceholderImage(title || 'Book'),
    publishYear: null,
  };
}

// Improved function to try getting book details from multiple sources with better error handling
export async function tryMultipleApiSources(id: string): Promise<SearchResult> {
  // Return values from partial successful data
  let partialResult: Partial<SearchResult> = {
    id
  };
  
  try {
    // Try direct fetching based on ID first
    try {
      if (id.startsWith('OL')) {
        return await getOpenLibraryBookDetails(id);
      } else {
        return await getGoogleBookDetails(id);
      }
    } catch (error) {
      console.log('Primary API fetch failed, trying alternative sources');
      // Continue to next approach
    }
    
    // If direct ID fetch failed, try the parallel approach with multiple APIs
    return await fetchFromMultipleApis(id);
    
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
