
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import BookShelf from '@/components/books/BookShelf';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';
import { Button } from '@/components/ui/button';
import { Book, BookOpen, BookmarkPlus, Check, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import BookClubsList from '@/components/bookclubs/BookClubsList';
import { PersonalizedRecommendations } from '@/components/recommendations/PersonalizedRecommendations';

const Library = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState('all');
  const isMobile = useIsMobile();
  
  // Use our custom hook for local library management
  const { 
    books, 
    filteredBooks,
  } = useLocalLibrary(debouncedSearchTerm, activeTab);

  // Get counts for each shelf to display as badges
  const readingCount = books.filter(book => book.shelf === 'reading').length;
  const wantToReadCount = books.filter(book => book.shelf === 'want-to-read').length;
  const completedCount = books.filter(book => book.progress === 100).length;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('library')}</h1>
          <p className="text-muted-foreground">
            {t('language') === 'de'
              ? 'Verwalte deine Bücher und deinen Lesefortschritt'
              : 'Manage your books and reading progress'}
          </p>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>{t('allBooks')}</span>
              <Badge variant="secondary" className="ml-1">
                {books.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{t('language') === 'de' ? 'Lesend' : 'Reading'}</span>
              {readingCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {readingCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="want-to-read" className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" />
              <span>{t('language') === 'de' ? 'Leseliste' : 'Want to Read'}</span>
              {wantToReadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {wantToReadCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{t('language') === 'de' ? 'Abgeschlossen' : 'Completed'}</span>
              {completedCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {completedCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="bookclubs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t('language') === 'de' ? 'Lesegruppen' : 'Book Clubs'}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <BookShelf 
              books={filteredBooks}
              shelfType="all"
              emptyMessage={t('language') === 'de' ? 'Keine Bücher gefunden' : 'No books found'}
            />
            
            {/* Personalisierte Empfehlungen */}
            {books.length > 0 && !searchTerm && (
              <div className="mt-12">
                <PersonalizedRecommendations />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reading" className="mt-6">
            <BookShelf 
              books={filteredBooks}
              shelfType="reading"
              emptyMessage={t('language') === 'de' ? 'Keine Bücher, die du gerade liest' : 'No books currently being read'}
            />
          </TabsContent>
          
          <TabsContent value="want-to-read" className="mt-6">
            <BookShelf 
              books={filteredBooks}
              shelfType="want-to-read"
              emptyMessage={t('language') === 'de' ? 'Keine Bücher auf deiner Leseliste' : 'No books in your reading list'}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <BookShelf 
              books={filteredBooks}
              shelfType="completed"
              emptyMessage={t('language') === 'de' ? 'Keine abgeschlossenen Bücher' : 'No completed books'}
            />
          </TabsContent>
          
          <TabsContent value="bookclubs" className="mt-6">
            <BookClubsList variant="joined" limit={6} />
            
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/bookclubs')}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                {t('language') === 'de' ? 'Alle Lesegruppen anzeigen' : 'View all book clubs'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Library;
