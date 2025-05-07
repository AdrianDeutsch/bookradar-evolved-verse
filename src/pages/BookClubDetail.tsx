
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useBookClubs } from '@/hooks/useBookClubs';
import { useToast } from '@/hooks/use-toast';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Book, MessageSquare, LogOut, Send, ArrowLeft, Loader2, UserMinus, Settings } from 'lucide-react';
import BookCard from '@/components/books/BookCard';
import { Badge } from '@/components/ui/badge';

const BookClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { books } = useLocalLibrary();
  
  const { 
    getBookClub, 
    isClubMember, 
    leaveBookClub, 
    sendMessage,
    updateCurrentBook,
    currentUser
  } = useBookClubs();
  
  const [activeTab, setActiveTab] = useState("discussion");
  const [message, setMessage] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [updatingBook, setUpdatingBook] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
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
        const foundClub = getBookClub(id);
        setClub(foundClub);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [id, getBookClub]);
  
  // Check if user is a member
  const isMember = id ? isClubMember(id) : false;
  
  // Check if user is admin (creator)
  const isAdmin = club?.members[0] === currentUser.id;
  
  // If no club ID or club not found after loading, return to overview
  useEffect(() => {
    if (!loading && (!id || !club)) {
      toast({
        title: language === 'de' ? 'Lesegruppe nicht gefunden' : 'Book club not found',
        description: language === 'de'
          ? 'Die angeforderte Lesegruppe existiert nicht'
          : 'The requested book club does not exist',
        variant: "destructive"
      });
      navigate('/bookclubs');
    }
  }, [id, club, navigate, toast, language, loading]);
  
  // If user is not a member, show about tab
  useEffect(() => {
    if (club && !isMember) {
      setActiveTab('about');
    }
  }, [club, isMember]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !message.trim()) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      const success = sendMessage(id, message.trim());
      if (success) {
        setMessage('');
      } else {
        setError(language === 'de'
          ? 'Nachricht konnte nicht gesendet werden'
          : 'Message could not be sent');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(language === 'de'
        ? 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
        : 'An error occurred. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleLeaveClub = async () => {
    if (!id) return;
    
    setLeavingGroup(true);
    
    try {
      const success = leaveBookClub(id);
      
      if (success) {
        toast({
          title: language === 'de' ? 'Lesegruppe verlassen' : 'Left book club',
          description: language === 'de'
            ? 'Du hast die Lesegruppe verlassen'
            : 'You have left the book club'
        });
        navigate('/bookclubs');
      } else {
        toast({
          title: language === 'de' ? 'Fehler' : 'Error',
          description: language === 'de'
            ? 'Die Lesegruppe konnte nicht verlassen werden'
            : 'Could not leave the book club',
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error leaving club:', err);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
          : 'An error occurred. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLeavingGroup(false);
    }
  };
  
  const handleBookChange = async (bookId: string) => {
    if (!id || !bookId) return;
    
    setSelectedBookId(bookId);
    setUpdatingBook(true);
    
    try {
      updateCurrentBook(id, bookId);
      
      toast({
        title: language === 'de' ? 'Buch aktualisiert' : 'Book updated',
        description: language === 'de'
          ? 'Das aktuelle Buch wurde aktualisiert'
          : 'The current book has been updated'
      });
    } catch (err) {
      console.error('Error updating book:', err);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Das Buch konnte nicht aktualisiert werden'
          : 'Could not update the book',
        variant: "destructive"
      });
    } finally {
      setUpdatingBook(false);
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
          
          {/* Loading State for Club Header */}
          <Skeleton className="h-48 sm:h-40 rounded-lg w-full" />
          
          {/* Loading State for Club Content */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="space-y-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!club) {
    return null; // Early return if no club found (will be handled by useEffect)
  }

  // Sort messages by timestamp (newest last)
  const sortedMessages = [...club.messages].sort((a, b) => a.timestamp - b.timestamp);
  
  // Find data for current book
  const currentBook = books.find(book => book.id === club.currentBookId);
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(
      language === 'de' ? 'de-DE' : 'en-US',
      { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      }
    );
  };
  
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
        <div className="relative h-48 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
          {club.imageUrl && (
            <img 
              src={club.imageUrl} 
              alt={club.name} 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
            />
          )}
          <div className="absolute inset-0 bg-black/20 p-6 flex flex-col justify-end">
            <h1 className="text-3xl font-bold text-white">{club.name}</h1>
            <div className="flex items-center gap-2 text-white/90 mt-2">
              <Users className="h-4 w-4" />
              <span>{club.members.length} {language === 'de' ? 'Mitglieder' : 'Members'}</span>
            </div>
          </div>
          
          {isMember && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 gap-1 bg-white"
              onClick={handleLeaveClub}
              disabled={leavingGroup}
            >
              {leavingGroup ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
              {language === 'de' ? 'Verlassen' : 'Leave'}
            </Button>
          )}
          
          {isAdmin && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="flex gap-1 items-center">
                <Settings className="h-3 w-3" />
                {language === 'de' ? 'Admin' : 'Admin'}
              </Badge>
            </div>
          )}
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
                    <Users className="h-4 w-4" />
                    {language === 'de' ? 'Dieser Lesegruppe beitreten' : 'Join this Book Club'}
                  </Button>
                )}
                
                {currentBook && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">
                      {language === 'de' ? 'Aktuelles Buch' : 'Current Book'}
                    </h3>
                    <div className="w-48">
                      <BookCard
                        id={currentBook.id}
                        title={currentBook.title}
                        author={currentBook.author}
                        coverUrl={currentBook.coverUrl}
                        rating={currentBook.rating}
                      />
                    </div>
                  </div>
                )}
                
                {/* Members List */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">
                    {language === 'de' ? 'Mitglieder' : 'Members'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {club.members.map((memberId, index) => (
                      <div key={memberId} className="flex items-center gap-2 border rounded-full px-3 py-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {memberId === currentUser.id 
                              ? currentUser.name.charAt(0)
                              : `U${index + 1}`}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {memberId === currentUser.id 
                            ? `${currentUser.name} (${language === 'de' ? 'du' : 'you'})`
                            : index === 0 
                              ? `${language === 'de' ? 'Ersteller' : 'Creator'}`
                              : `${language === 'de' ? 'Mitglied' : 'Member'} ${index}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Discussion Tab */}
          {isMember && (
            <TabsContent value="discussion" className="pt-4">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>
                    {language === 'de' ? 'Diskussion' : 'Discussion'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'de' 
                      ? 'Diskutiere mit anderen Mitgliedern über Bücher und mehr'
                      : 'Discuss with other members about books and more'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Message Area */}
                  <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-md bg-muted/20" id="messages-container">
                    {sortedMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {language === 'de'
                            ? 'Noch keine Nachrichten. Starte die Konversation!'
                            : 'No messages yet. Start the conversation!'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedMessages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.userId === currentUser.id ? 'justify-end' : ''}`}>
                            {msg.userId !== currentUser.id && (
                              <Avatar>
                                <AvatarFallback>{msg.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[75%] ${msg.userId === currentUser.id ? 'bg-primary/10 text-primary-foreground' : 'bg-muted'} p-3 rounded-lg`}>
                              <div className="flex items-baseline gap-2">
                                <h4 className="font-medium">{msg.userId === currentUser.id ? 
                                  (language === 'de' ? 'Du' : 'You') : 
                                  msg.username}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(msg.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{msg.content}</p>
                            </div>
                            {msg.userId === currentUser.id && (
                              <Avatar>
                                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 mb-4">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={language === 'de' ? "Nachricht eingeben..." : "Type a message..."}
                      className="flex-1"
                      disabled={sendingMessage}
                    />
                    <Button type="submit" disabled={!message.trim() || sendingMessage}>
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="sr-only">{language === 'de' ? 'Senden' : 'Send'}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
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
                  <CardDescription>
                    {language === 'de'
                      ? 'Verwalte die Bücher für diese Lesegruppe'
                      : 'Manage books for this book club'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Select Current Book - Only for admins */}
                    {isAdmin && (
                      <div>
                        <h3 className="text-lg font-medium mb-3">
                          {language === 'de' ? 'Aktuelles Buch festlegen' : 'Set Current Book'}
                        </h3>
                        {books.length > 0 ? (
                          <div className="space-y-2">
                            <Select
                              value={selectedBookId || club.currentBookId || ""}
                              onValueChange={handleBookChange}
                              disabled={updatingBook}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={
                                  language === 'de' 
                                    ? "Wähle ein Buch für die Gruppe" 
                                    : "Select a book for the club"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {books.map(book => (
                                  <SelectItem key={book.id} value={book.id}>
                                    {book.title} - {book.author}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {updatingBook && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {language === 'de' ? 'Wird aktualisiert...' : 'Updating...'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {language === 'de'
                              ? 'Füge zuerst Bücher zu deiner Bibliothek hinzu'
                              : 'Add books to your library first'}
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => navigate('/library')}
                              className="px-0"
                            >
                              {language === 'de' ? 'Zur Bibliothek' : 'Go to Library'}
                            </Button>
                          </div>
                        )}
                        
                        {!isAdmin && (
                          <div className="text-sm text-muted-foreground mt-2">
                            {language === 'de'
                              ? 'Nur der Gruppenadministrator kann Bücher festlegen'
                              : 'Only the group administrator can set books'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Current Book Display */}
                    {currentBook ? (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-4">
                          {language === 'de' ? 'Aktuelles Buch' : 'Current Book'}
                        </h3>
                        <div className="w-48">
                          <BookCard
                            id={currentBook.id}
                            title={currentBook.title}
                            author={currentBook.author}
                            coverUrl={currentBook.coverUrl}
                            rating={currentBook.rating}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center border rounded-md bg-muted/20">
                        <Book className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <h4 className="font-medium mb-1">
                          {language === 'de' ? 'Kein Buch ausgewählt' : 'No book selected'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isAdmin 
                            ? (language === 'de'
                                ? 'Wähle ein Buch für die Gruppe aus'
                                : 'Select a book for the group')
                            : (language === 'de'
                                ? 'Der Gruppenadministrator hat noch kein Buch festgelegt'
                                : 'The group administrator has not set a book yet')
                          }
                        </p>
                      </div>
                    )}
                    
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
                              <BookCard
                                key={book.id}
                                id={book.id}
                                title={book.title}
                                author={book.author}
                                coverUrl={book.coverUrl}
                                rating={book.rating}
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
