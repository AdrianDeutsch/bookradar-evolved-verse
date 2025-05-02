
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';
import { SearchResult, searchBooks } from '@/services/bookService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import BookCard from '@/components/books/BookCard';

interface PersonalizedRecommendationsProps {
  limit?: number;
  showHeader?: boolean;
}

export function PersonalizedRecommendations({ limit = 4, showHeader = true }: PersonalizedRecommendationsProps) {
  const { language } = useLanguage();
  const { books } = useLocalLibrary();
  
  const [authorRecommendations, setAuthorRecommendations] = useState<SearchResult[]>([]);
  const [genreRecommendations, setGenreRecommendations] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('authors');
  
  // Anzahl an Autoren und Genres extrahieren
  const authorCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(book => {
      if (book.author) {
        counts[book.author] = (counts[book.author] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([author]) => author);
  }, [books]);
  
  // Genres basierend auf Buchtiteln und Autoren ableiten
  // (Vereinfacht, da wir keine echten Genre-Daten haben)
  const inferredGenres = React.useMemo(() => {
    const genreKeywords: { [key: string]: string[] } = {
      'fiction': ['novel', 'fiction', 'story'],
      'fantasy': ['fantasy', 'magic', 'wizard', 'dragon'],
      'scifi': ['sci-fi', 'science fiction', 'space', 'future'],
      'thriller': ['thriller', 'mystery', 'crime', 'detective'],
      'romance': ['love', 'romance', 'relationship'],
      'history': ['history', 'historical', 'century', 'ancient'],
      'biography': ['biography', 'memoir', 'life', 'autobiography'],
    };
    
    const genreCounts: Record<string, number> = {};
    
    books.forEach(book => {
      const titleAndAuthor = `${book.title} ${book.author}`.toLowerCase();
      
      for (const [genre, keywords] of Object.entries(genreKeywords)) {
        if (keywords.some(keyword => titleAndAuthor.includes(keyword))) {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        }
      }
    });
    
    return Object.entries(genreCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([genre]) => genre);
  }, [books]);

  // Empfehlungen nach Autoren laden
  useEffect(() => {
    const fetchAuthorRecommendations = async () => {
      if (authorCounts.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const randomAuthor = authorCounts[Math.floor(Math.random() * authorCounts.length)];
        
        const results = await searchBooks({
          query: `author:${randomAuthor}`,
          limit: limit * 2
        });
        
        // Nur Bücher, die noch nicht in der Bibliothek sind
        const filteredResults = results.filter(
          result => !books.some(book => book.id === result.id)
        ).slice(0, limit);
        
        setAuthorRecommendations(filteredResults);
      } catch (error) {
        console.error('Error fetching author recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuthorRecommendations();
  }, [authorCounts, books, limit]);

  // Empfehlungen nach Genres laden
  useEffect(() => {
    const fetchGenreRecommendations = async () => {
      if (inferredGenres.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const randomGenre = inferredGenres[Math.floor(Math.random() * inferredGenres.length)];
        
        const results = await searchBooks({
          query: randomGenre,
          limit: limit * 2
        });
        
        // Nur Bücher, die noch nicht in der Bibliothek sind
        const filteredResults = results.filter(
          result => !books.some(book => book.id === result.id)
        ).slice(0, limit);
        
        setGenreRecommendations(filteredResults);
      } catch (error) {
        console.error('Error fetching genre recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGenreRecommendations();
  }, [inferredGenres, books, limit]);

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>
            {language === 'de' ? 'Personalisierte Empfehlungen' : 'Personalized Recommendations'}
          </CardTitle>
          <CardDescription>
            {language === 'de'
              ? 'Buchempfehlungen basierend auf deinen Lesegewohnheiten'
              : 'Book recommendations based on your reading habits'}
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        {books.length < 3 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'de'
              ? 'Füge mehr Bücher zu deiner Bibliothek hinzu, um personalisierte Empfehlungen zu erhalten'
              : 'Add more books to your library to get personalized recommendations'}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="authors">
                {language === 'de' ? 'Nach Autoren' : 'By Authors'}
              </TabsTrigger>
              <TabsTrigger value="genres">
                {language === 'de' ? 'Nach Genres' : 'By Genres'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="authors">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : authorRecommendations.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {authorRecommendations.map(book => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.coverUrl || ''}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'de'
                    ? 'Keine Empfehlungen gefunden'
                    : 'No recommendations found'}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="genres">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : genreRecommendations.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {genreRecommendations.map(book => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      coverUrl={book.coverUrl || ''}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'de'
                    ? 'Keine Empfehlungen gefunden'
                    : 'No recommendations found'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
