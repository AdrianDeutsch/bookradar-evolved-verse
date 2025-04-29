
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Book as BookIcon, Calendar, User, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { getBookDetails } from '@/services/bookService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const BookDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Improved query configuration with better retry logic
  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookDetails(id as string),
    enabled: !!id,
    retry: 3, // Increase retry attempts
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000), // Progressive retry with backoff
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleStartReading = () => {
    if (id) {
      navigate(`/book/${id}/read`);
    } else {
      toast({
        title: t('error'),
        description: t('language') === 'de'
          ? 'Buch-ID fehlt. Kann Lesemodus nicht starten.'
          : 'Book ID missing. Cannot start reading mode.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    // Enhanced loading state with skeleton UI
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 animate-fade-in">
          <div className="mb-6">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('language') === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
            </Link>
          </div>
          
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <div className="space-y-4">
              <Skeleton className="w-full aspect-[2/3] rounded-lg" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // More refined error handling - even if we have an error, we might still have partial book data
  // We'll show what we have instead of just an error message
  const hasPartialData = book && (book.title || book.coverUrl || book.cover || book.author);

  if ((error || !book) && !hasPartialData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
          <div className="text-center py-12 space-y-6">
            <BookIcon className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {t('language') === 'de' 
                  ? 'Details zu diesem Buch konnten momentan nicht geladen werden'
                  : 'Book details could not be loaded at this time'}
              </h2>
              <p className="text-muted-foreground">
                {t('language') === 'de' 
                  ? 'Wir konnten keine Informationen zu diesem Buch finden. Bitte versuche es später erneut.'
                  : 'We could not find any information for this book. Please try again later.'}
              </p>
            </div>
            <Button 
              variant="outline"
              asChild
            >
              <Link to="/">
                {t('language') === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // We'll show what we have, even if it's just partial data
  const displayBook = book || {
    id: id,
    title: '',
    author: '',
    coverUrl: null,
    cover: null,
    description: '',
    publishYear: null
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 animate-fade-in">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('language') === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
          </Link>
        </div>
        
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-4">
            {(displayBook.cover || displayBook.coverUrl) ? (
              <img 
                src={displayBook.cover || displayBook.coverUrl || '/placeholder.svg'} 
                alt={displayBook.title || (t('language') === 'de' ? 'Buchcover' : 'Book cover')}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                  e.currentTarget.onerror = null;
                }}
                className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <BookIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleStartReading}
                disabled={!displayBook.title}
              >
                {t('startReading')}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {displayBook.title || (t('language') === 'de' ? 'Titel nicht verfügbar' : 'Title unavailable')}
              </h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {displayBook.author || (t('language') === 'de' ? 'Unbekannter Autor' : 'Unknown author')}
                  </span>
                </div>
                {displayBook.publishYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{displayBook.publishYear}</span>
                  </div>
                )}
              </div>
            </div>

            {displayBook.description ? (
              <div className="prose dark:prose-invert max-w-none">
                <p>{displayBook.description}</p>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p>
                  {t('language') === 'de'
                    ? 'Keine Beschreibung verfügbar. Wir arbeiten daran, weitere Informationen zu diesem Buch zu sammeln.'
                    : 'No description available. We are working on gathering more information about this book.'}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                {t('language') === 'de'
                  ? 'Hinweis: Einige Details zu diesem Buch konnten nicht geladen werden. Die angezeigten Informationen könnten unvollständig sein.'
                  : 'Note: Some details for this book could not be loaded. The displayed information may be incomplete.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetails;
