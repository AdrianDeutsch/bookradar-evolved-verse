
export interface Quote {
  content: string;
  author: string;
  tags: string[];
  authorSlug: string;
  length: number;
  dateAdded: string;
  dateModified: string;
}

/**
 * Fetch a random quote from the Quotable API
 * Optionally filtered by tag
 */
export const fetchRandomQuote = async (tag: string = ''): Promise<Quote | null> => {
  try {
    const url = tag 
      ? `https://api.quotable.io/random?tags=${encodeURIComponent(tag)}`
      : 'https://api.quotable.io/random';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Error fetching quote:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data as Quote;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
};

/**
 * Fetch a random quote related to books or reading
 */
export const fetchBookRelatedQuote = async (): Promise<Quote | null> => {
  // Try to get a quote specifically about books or reading
  const bookTags = ['books', 'reading', 'literature', 'knowledge'];
  
  // Try each tag in sequence until we get a valid quote
  for (const tag of bookTags) {
    const quote = await fetchRandomQuote(tag);
    if (quote) return quote;
  }
  
  // If all specific tags fail, fall back to any random quote
  return fetchRandomQuote();
};
