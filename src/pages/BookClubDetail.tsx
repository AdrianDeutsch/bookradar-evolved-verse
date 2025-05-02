
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
import { Users, Book, MessageSquare, LogOut, Send } from 'lucide-react';
import BookCard from '@/components/books/BookCard';

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
    updateCurrentBook
  } = useBookClubs();
  
  const [activeTab, setActiveTab] = useState("discussion");
  const [message, setMessage] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  
  const club = getBookClub(id || '');
  
  // Prüfen, ob der Nutzer ein Mitglied ist
  const isMember = id ? isClubMember(id) : false;
  
  // Wenn keine Club-ID oder Club nicht gefunden, zur Übersicht zurückkehren
  useEffect(() => {
    if (!id || !club) {
      toast({
        title: language === 'de' ? 'Lesegruppe nicht gefunden' : 'Book club not found',
        description: language === 'de'
          ? 'Die angeforderte Lesegruppe existiert nicht'
          : 'The requested book club does not exist',
        variant: "destructive"
      });
      navigate('/bookclubs');
    }
  }, [id, club, navigate, toast, language]);
  
  // Wenn Nutzer nicht Mitglied ist, Beitrittsmöglichkeit zeigen
  useEffect(() => {
    if (club && !isMember) {
      setActiveTab('about');
    }
  }, [club, isMember]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (id && message.trim()) {
      sendMessage(id, message.trim());
      setMessage('');
    }
  };
  
  const handleLeaveClub = () => {
    if (id) {
      leaveBookClub(id);
      toast({
        title: language === 'de' ? 'Lesegruppe verlassen' : 'Left book club',
        description: language === 'de'
          ? 'Du hast die Lesegruppe verlassen'
          : 'You have left the book club'
      });
      navigate('/bookclubs');
    }
  };
  
  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    if (id && bookId) {
      updateCurrentBook(id, bookId);
      toast({
        title: language === 'de' ? 'Buch aktualisiert' : 'Book updated',
        description: language === 'de'
          ? 'Das aktuelle Buch wurde aktualisiert'
          : 'The current book has been updated'
      });
    }
  };
  
  if (!club) {
    return null; // Frühes Return, wenn kein Club gefunden wurde
  }

  // Sortiere Nachrichten nach Zeitstempel (neueste zuletzt)
  const sortedMessages = [...club.messages].sort((a, b) => a.timestamp - b.timestamp);
  
  // Finde Daten zum aktuellen Buch
  const currentBook = books.find(book => book.id === club.currentBookId);
  
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/bookclubs')}
          className="mb-4"
        >
          ← {language === 'de' ? 'Zurück zu Lesegruppen' : 'Back to Book Clubs'}
        </Button>
        
        {/* Club Header */}
        <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
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
            >
              <LogOut className="h-4 w-4" />
              {language === 'de' ? 'Verlassen' : 'Leave'}
            </Button>
          )}
        </div>
        
        {/* Club Inhalt mit Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="about">
              {language === 'de' ? 'Über' : 'About'}
            </TabsTrigger>
            {isMember && (
              <>
                <TabsTrigger value="discussion">
                  {language === 'de' ? 'Diskussion' : 'Discussion'}
                </TabsTrigger>
                <TabsTrigger value="books">
                  {language === 'de' ? 'Bücher' : 'Books'}
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          {/* Über Tab */}
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
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Diskussions Tab */}
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
                  {/* Nachrichtenbereich */}
                  <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-md bg-muted/20">
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
                          <div key={msg.id} className="flex gap-3">
                            <Avatar>
                              <AvatarFallback>{msg.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-baseline gap-2">
                                <h4 className="font-medium">{msg.username}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.timestamp).toLocaleString(
                                    language === 'de' ? 'de-DE' : 'en-US',
                                    { 
                                      day: 'numeric', 
                                      month: 'short', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Nachrichteneingabe */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 mb-4">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={language === 'de' ? "Nachricht eingeben..." : "Type a message..."}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">{language === 'de' ? 'Senden' : 'Send'}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {/* Bücher Tab */}
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
                    {/* Aktuelles Buch auswählen */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        {language === 'de' ? 'Aktuelles Buch' : 'Current Book'}
                      </h3>
                      <Select
                        value={selectedBookId || club.currentBookId || ""}
                        onValueChange={handleBookChange}
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
                    </div>
                    
                    {/* Aktuelles Buch anzeigen */}
                    {currentBook && (
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
                    )}
                    
                    {/* Vergangene Bücher, falls vorhanden */}
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
