
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBookDetails, SearchResult } from '@/services/bookService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface UseBookInfoOptions {
  id: string;
  enableToasts?: boolean;
}

interface BookInfoResult {
  book: SearchResult | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useBookInfo = ({ id, enableToasts = true }: UseBookInfoOptions): BookInfoResult => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Use React Query for automatic caching and retries
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookDetails', id],
    queryFn: () => getBookDetails(id),
    retry: 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Handle errors with a side effect
  React.useEffect(() => {
    if (error && enableToasts) {
      console.error('Error fetching book details:', error);
      toast({
        title: t('language') === 'de' ? 'Fehler beim Laden' : 'Loading Error',
        description: t('language') === 'de'
          ? 'Buchdetails konnten nicht geladen werden. Bitte versuche es später erneut.'
          : 'Could not load book details. Please try again later.',
        variant: "destructive"
      });
    }
  }, [error, toast, t, enableToasts]);
  
  return {
    book: data || null,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
