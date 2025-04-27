
// OpenLibrary API types
declare namespace OpenLibrary {
  interface Work {
    key: string;
    title: string;
    description?: string | {
      type: string;
      value: string;
    };
    covers?: number[];
    first_publish_date?: string;
    authors?: Array<{ author: { key: string } }>;
  }

  interface Author {
    key: string;
    name: string;
    birth_date?: string;
    bio?: string;
  }

  interface SearchDoc {
    key: string;
    title: string;
    author_name?: string[];
    cover_i?: number;
    first_publish_year?: number;
  }

  interface SearchResponse {
    numFound: number;
    start: number;
    docs: SearchDoc[];
  }
}

// Google Books API types
declare namespace GoogleBooks {
  interface Volume {
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

  interface SearchResponse {
    items: Volume[];
    totalItems: number;
  }
}

// Quotable API types
declare namespace Quotable {
  interface Quote {
    _id: string;
    content: string;
    author: string;
    tags: string[];
    authorSlug: string;
    length: number;
    dateAdded: string;
    dateModified: string;
  }
}
