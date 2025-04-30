
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Book as BookIcon, Calendar, User, ArrowLeft, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { getBookDetails } from '@/services/bookService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const BookDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Improved query configuration with better retry logic and refetch capabilities
  const { 
    data: book, 
    isLoading, 
    error, 
    isError, 
    refetch, 
    isRefetching 
  } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookDetails(id as string),
    enabled: !!id,
    retry: 3, // Increase retry attempts
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000), // Progressive retry with backoff
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show toast on error but only if it's not during a refetch
  React.useEffect(() => {
    if (isError && !isRefetching) {
      toast({
        title: t('error'),
        description: t('language') === 'de' 
          ? 'Fehler beim Laden der Buchdaten. Versuche erneut.' 
          : 'Error loading book data. Trying alternative sources.',
        variant: 'destructive',
        duration: 5000,
      });
      
      // Try to refetch after showing the error
      setTimeout(() => refetch(), 1000);
    }
  }, [isError, isRefetching, toast, t, refetch]);

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

  // Generate Amazon search link based on book title and author
  const generateAmazonLink = (title?: string, author?: string) => {
    if (!title) return '';
    const searchQuery = author 
      ? `${encodeURIComponent(title)}+${encodeURIComponent(author)}`
      : encodeURIComponent(title);
    return `https://www.amazon.com/s?k=${searchQuery}`;
  };

  // Show retry button if loading failed
  const handleRetry = () => {
    toast({
      title: t('language') === 'de' ? 'Versuche erneut' : 'Trying again',
      description: t('language') === 'de' 
        ? 'Suche nach alternativen Quellen...' 
        : 'Searching alternative sources...',
    });
    refetch();
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
          <div className="mb-6">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('language') === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
            </Link>
          </div>
          
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
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="default"
                className="flex items-center gap-2"
                onClick={handleRetry}
                disabled={isRefetching}
              >
                {isRefetching && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('language') === 'de' ? 'Alternative Quellen prüfen' : 'Try Alternative Sources'}
              </Button>
              
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

  // Generate Amazon link for this book
  const amazonLink = generateAmazonLink(displayBook.title, displayBook.author);

  // Get a larger cover image if possible (for OpenLibrary covers)
  const getLargerCoverUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('covers.openlibrary.org') && url.includes('-M.jpg')) {
      return url.replace('-M.jpg', '-L.jpg');
    }
    return url;
  };

  // Show a retry button if we have very minimal data
  const hasMinimalData = displayBook.title === 'Book Information' || 
                         displayBook.author === 'Unknown Author' ||
                         !displayBook.description ||
                         displayBook.description === 'No description available' ||
                         displayBook.description === 'Details for this book are currently unavailable. Please try again later.';

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
              <div className="relative">
                <img 
                  src={getLargerCoverUrl(displayBook.cover || displayBook.coverUrl) || '/placeholder.svg'} 
                  alt={displayBook.title || (t('language') === 'de' ? 'Buchcover' : 'Book cover')}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                    e.currentTarget.onerror = null;
                  }}
                  className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]"
                />
                
                {isRefetching && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                    <div className="bg-white bg-opacity-80 rounded-full p-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <BookIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            {hasMinimalData && !isRefetching && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex items-center gap-2 text-xs"
                onClick={handleRetry}
              >
                {t('language') === 'de' ? 'Weitere Details suchen' : 'Search for more details'}
              </Button>
            )}
            
            <div className="flex flex-col gap-2">
              <Button 
                className="flex-1" 
                onClick={handleStartReading}
                disabled={!displayBook.title}
              >
                {t('startReading')}
              </Button>
              
              {amazonLink && (
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  asChild
                >
                  <a href={amazonLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    {t('language') === 'de' ? 'Kaufen auf Amazon' : 'Buy on Amazon'}
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              )}
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
                <div className="flex items-center justify-between">
                  <div>
                    {t('language') === 'de'
                      ? 'Hinweis: Einige Details zu diesem Buch konnten nicht geladen werden. Die angezeigten Informationen könnten unvollständig sein.'
                      : 'Note: Some details for this book could not be loaded. The displayed information may be incomplete.'}
                  </div>
                  {!isRefetching && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRetry}
                      className="ml-4 text-xs"
                    >
                      {t('language') === 'de' ? 'Erneut versuchen' : 'Try again'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetails;
