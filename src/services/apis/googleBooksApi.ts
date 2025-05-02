
import { createPlaceholderImage } from '../bookApi';
import { SearchOptions, SearchResult } from '../bookService';

/**
 * Search for books using Google Books API
 */
export const searchGoogleBooks = async ({ query, limit = 10, page = 1 }: SearchOptions): Promise<SearchResult[]> => {
  try {
    // Google Books API uses startIndex instead of page
    const startIndex = (page - 1) * limit;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${limit}&startIndex=${startIndex}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error with Google Books API:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    return data.items.map((item: any) => {
      const volumeInfo = item.volumeInfo;
      
      // Handle missing cover images with a good placeholder
      const coverUrl = volumeInfo.imageLinks ? 
        (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail) : 
        createPlaceholderImage(volumeInfo.title, volumeInfo.authors ? volumeInfo.authors[0] : undefined);
      
      return {
        id: item.id,
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author',
        coverUrl: coverUrl,
        cover: coverUrl,
        publishYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
        description: volumeInfo.description || null,
        authorBio: null
      };
    });
  } catch (error) {
    console.error('Network error with Google Books API:', error);
    return [];
  }
}

/**
 * Fallback for book of the day using Google Books API
 */
export const fetchGoogleBookOfTheDay = async (): Promise<SearchResult | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      "https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=40",
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    // Pick a random book with image if possible
    const booksWithImages = data.items.filter(
      (item: any) => item.volumeInfo && item.volumeInfo.imageLinks
    );
    
    const books = booksWithImages.length > 0 ? booksWithImages : data.items;
    const randomIndex = Math.floor(Math.random() * books.length);
    const randomBook = books[randomIndex].volumeInfo;
    
    const coverUrl = randomBook.imageLinks ? 
      randomBook.imageLinks.thumbnail : 
      createPlaceholderImage(randomBook.title, randomBook.authors ? randomBook.authors[0] : undefined);
    
    return {
      id: data.items[randomIndex].id,
      title: randomBook.title || 'Book of the Day',
      author: randomBook.authors ? randomBook.authors[0] : 'Unknown Author',
      coverUrl: coverUrl,
      cover: coverUrl,
      publishYear: randomBook.publishedDate ? parseInt(randomBook.publishedDate.substring(0, 4)) : null,
      description: randomBook.description || null,
      authorBio: null
    };
  } catch (error) {
    console.error('Network error with fallback book of the day:', error);
    return null;
  }
};
