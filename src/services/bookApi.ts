
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
      const authorKey = work.authors[0].author.key;
      const authorResponse = await fetch(`https://openlibrary.org${authorKey}.json`);
      if (authorResponse.ok) {
        const authorData: OpenLibraryAuthor = await authorResponse.json();
        authorName = authorData.name;
      }
    }

    const coverUrl = work.covers?.[0]
      ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
      : null;

    return {
      id,
      title: work.title,
      author: authorName,
      description: work.description?.toString() || null,
      cover: coverUrl,
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
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
  if (!response.ok) throw new Error('Book not found');
  
  const book: GoogleBook = await response.json();
  const { volumeInfo } = book;

  return {
    id: book.id,
    title: volumeInfo.title,
    author: volumeInfo.authors?.[0] || 'Unknown Author',
    description: volumeInfo.description || null,
    cover: volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.small || volumeInfo.imageLinks?.thumbnail || null,
    publishYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.slice(0, 4)) : null,
  };
}
