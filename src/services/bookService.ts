
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
  publishYear?: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  page?: number;
}

/**
 * Search for books using the OpenLibrary API
 */
export const searchBooks = async ({ query, limit = 10, page = 1 }: SearchOptions): Promise<SearchResult[]> => {
  if (!query.trim()) {
    return [];
  }
  
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.docs.map((doc: OpenLibraryDoc) => ({
      id: doc.key.replace('/works/', ''),
      title: doc.title,
      author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
      coverUrl: doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
        : null,
      publishYear: doc.first_publish_year
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

/**
 * Get book details from OpenLibrary API
 */
export const getBookDetails = async (bookId: string) => {
  try {
    const response = await fetch(`https://openlibrary.org/works/${bookId}.json`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}

/**
 * Fetch "book of the day" from OpenLibrary
 */
export const fetchBookOfTheDay = async (): Promise<SearchResult | null> => {
  // For the book of the day, we'll get a random book from a curated list
  // In a real implementation, this might come from a specialized endpoint
  const popularTopics = ["fiction", "fantasy", "science", "classics", "biography"];
  const randomTopic = popularTopics[Math.floor(Math.random() * popularTopics.length)];
  
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${randomTopic}&limit=20`
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.docs || data.docs.length === 0) {
      return null;
    }
    
    // Pick a random book from the results
    const randomIndex = Math.floor(Math.random() * Math.min(data.docs.length, 20));
    const randomBook = data.docs[randomIndex];
    
    return {
      id: randomBook.key.replace('/works/', ''),
      title: randomBook.title,
      author: randomBook.author_name ? randomBook.author_name[0] : 'Unknown Author',
      coverUrl: randomBook.cover_i 
        ? `https://covers.openlibrary.org/b/id/${randomBook.cover_i}-M.jpg` 
        : null,
      publishYear: randomBook.first_publish_year
    };
  } catch (error) {
    console.error('Error fetching book of the day:', error);
    return null;
  }
}
