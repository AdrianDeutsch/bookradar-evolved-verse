
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
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !book) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {t('language') === 'de' 
              ? 'Fehler beim Laden des Buches.'
              : 'Error loading book details.'}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-4">
            {book.cover ? (
              <img 
                src={book.cover} 
                alt={book.title} 
                className="w-full rounded-lg shadow-lg"
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
              <div className="prose dark:prose-invert">
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
