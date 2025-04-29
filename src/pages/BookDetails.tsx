
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Book as BookIcon, Calendar, User } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { getBookDetails } from '@/services/bookService';
import { Button } from '@/components/ui/button';

const BookDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookDetails(id as string),
    enabled: !!id,
    retry: 2, // Retry twice before showing an error
    retryDelay: 1000, // Retry after 1 second
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-bookradar-primary" />
            <p className="text-muted-foreground">
              {t('language') === 'de' 
                ? 'Buchinformationen werden geladen...'
                : 'Loading book information...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !book) {
    return (
      <Layout>
        <div className="text-center py-12 space-y-6">
          <BookIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t('language') === 'de' 
                ? 'Fehler beim Laden des Buches'
                : 'Error loading book details'}
            </h2>
            <p className="text-muted-foreground">
              {t('language') === 'de' 
                ? 'Die Buchinformationen konnten nicht geladen werden. Bitte versuche es später noch einmal.'
                : 'Could not load book information. Please try again later.'}
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            {t('language') === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 animate-fade-in">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-4">
            {(book.cover || book.coverUrl) ? (
              <img 
                src={book.cover || book.coverUrl} 
                alt={book.title}
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = '/placeholder.svg';
                  e.currentTarget.onerror = null; // Prevent infinite error loop
                }}
                className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]" // Keep aspect ratio consistent
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <BookIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1">
                {t('startReading')}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{book.author || t('unknown')}</span>
                </div>
                {book.publishYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{book.publishYear}</span>
                  </div>
                )}
              </div>
            </div>

            {book.description && (
              <div className="prose dark:prose-invert max-w-none">
                <p>{book.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetails;
