
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useBookClubs } from '@/hooks/useBookClubs';
import { useToast } from '@/hooks/use-toast';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
// Import our components
import BookClubHeader from '@/components/bookclubs/BookClubHeader';
import BookClubActions from '@/components/bookclubs/BookClubActions';
import BookClubBook from '@/components/bookclubs/BookClubBook';
import BookClubMembers from '@/components/bookclubs/BookClubMembers';
import BookClubChat from '@/components/bookclubs/BookClubChat';
import BookClubBookSelector from '@/components/bookclubs/BookClubBookSelector';

const BookClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { books } = useLocalLibrary();
  
  const { 
    getBookClub, 
    isClubMember, 
    updateCurrentBook,
    currentUser
  } = useBookClubs();
  
  const [activeTab, setActiveTab] = useState("discussion");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get club data with a small delay to simulate fetching
  const [club, setClub] = useState(() => {
    if (id) {
      return getBookClub(id);
    }
    return null;
  });
  
  useEffect(() => {
    // Simulate data fetching (in real world this would be an API call)
    const timer = setTimeout(() => {
      setLoading(false);
      if (id) {
        try {
          const foundClub = getBookClub(id);
          setClub(foundClub);
          if (!foundClub) {
            setError(language === 'de'
              ? 'Die angeforderte Lesegruppe existiert nicht'
              : 'The requested book club does not exist');
          } else {
            setError(null);
          }
        } catch (err) {
          console.error('Error fetching book club:', err);
          setError(language === 'de'
            ? 'Beim Laden der Lesegruppe ist ein Fehler aufgetreten'
            : 'An error occurred while loading the book club');
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [id, getBookClub, language]);
  
  // Check if user is a member
  const isMember = id && club ? isClubMember(id) : false;
  
  // Check if user is admin (creator)
  const isAdmin = club?.members[0] === currentUser.id;
  
  // If user is not a member, show about tab
  useEffect(() => {
    if (club && !isMember) {
      setActiveTab('about');
    }
  }, [club, isMember]);
  
  const handleBookChange = async (bookId: string) => {
    if (!id || !bookId) return;
    
    try {
      updateCurrentBook(id, bookId);
      
      // Get the updated club data
      if (id) {
        const updatedClub = getBookClub(id);
        setClub(updatedClub);
      }
    } catch (err) {
      console.error('Error updating book:', err);
      throw err;
    }
  };
  
  // Display loading skeleton
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/bookclubs')}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={16} />
            {language === 'de' ? 'Zurück zu Lesegruppen' : 'Back to Book Clubs'}
          </Button>
          
          <BookClubHeader isLoading={true} club={{
            id: '',
            name: '',
            description: '',
            createdAt: 0,
            members: [],
            currentBookId: null,
            books: [],
            messages: []
          }} isAdmin={false} />
          
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Display error message if club not found
  if (error) {
    return (
      <Layout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/bookclubs')}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={16} />
            {language === 'de' ? 'Zurück zu Lesegruppen' : 'Back to Book Clubs'}
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {language === 'de' ? 'Lesegruppe nicht gefunden' : 'Book club not found'}
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="text-center py-8">
            <Button onClick={() => navigate('/bookclubs')}>
              {language === 'de' ? 'Zurück zur Übersicht' : 'Back to Overview'}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!club) {
    return null; // Early return if no club found (will be handled by useEffect)
  }

  // Find data for current book
  const currentBook = club.currentBookId 
    ? books.find(book => book.id === club.currentBookId) || null
    : null;
  
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/bookclubs')}
          className="mb-4 gap-2"
        >
          <ArrowLeft size={16} />
          {language === 'de' ? 'Zurück zu Lesegruppen' : 'Back to Book Clubs'}
        </Button>
        
        {/* Club Header */}
        <div className="relative">
          <BookClubHeader club={club} isAdmin={isAdmin} />
          <BookClubActions clubId={club.id} isMember={isMember} />
        </div>
        
        {/* Club Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="about" className="flex-1 sm:flex-initial">
              {language === 'de' ? 'Über' : 'About'}
            </TabsTrigger>
            {isMember && (
              <>
                <TabsTrigger value="discussion" className="flex-1 sm:flex-initial">
                  {language === 'de' ? 'Diskussion' : 'Discussion'}
                </TabsTrigger>
                <TabsTrigger value="books" className="flex-1 sm:flex-initial">
                  {language === 'de' ? 'Bücher' : 'Books'}
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          {/* About Tab */}
          <TabsContent value="about" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'de' ? 'Über diese Lesegruppe' : 'About this Book Club'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6">{club.description}</p>
                
                {!isMember && (
                  <Button
                    onClick={() => navigate(`/bookclubs/join/${id}`)}
                    className="gap-1"
                  >
                    {language === 'de' ? 'Dieser Lesegruppe beitreten' : 'Join this Book Club'}
                  </Button>
                )}
                
                {currentBook && (
                  <div className="mt-8">
                    <BookClubBook book={currentBook} />
                  </div>
                )}
                
                {/* Members List */}
                <BookClubMembers members={club.members} currentUser={currentUser} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Discussion Tab */}
          {isMember && (
            <TabsContent value="discussion" className="pt-4">
              <BookClubChat 
                clubId={club.id}
                messages={club.messages}
                isMember={isMember}
              />
            </TabsContent>
          )}
          
          {/* Books Tab */}
          {isMember && (
            <TabsContent value="books" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'de' ? 'Bücher' : 'Books'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Book Selector - Admin only */}
                    {isAdmin && (
                      <BookClubBookSelector 
                        clubId={club.id}
                        currentBookId={club.currentBookId}
                        isAdmin={isAdmin}
                        onBookChange={handleBookChange}
                      />
                    )}
                    
                    {/* Current Book Display */}
                    <div className="mt-4">
                      <BookClubBook book={currentBook} />
                    </div>
                    
                    {/* Book History, if any */}
                    {club.books.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">
                          {language === 'de' ? 'Buchverlauf' : 'Book History'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {club.books.map((bookId) => {
                            const book = books.find(b => b.id === bookId);
                            if (!book) return null;
                            
                            return (
                              <BookClubBook 
                                key={book.id} 
                                book={book} 
                                showTitle={false}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default BookClubDetail;
