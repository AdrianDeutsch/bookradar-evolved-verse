
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookClubs, BookClub } from '@/hooks/useBookClubs';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Book, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookClubCard from './BookClubCard';

interface BookClubsListProps {
  variant?: 'all' | 'joined';
  limit?: number;
}

const BookClubsList: React.FC<BookClubsListProps> = ({ 
  variant = 'all',
  limit
}) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    bookClubs, 
    userClubs, 
    searchBookClubs, 
    joinBookClub, 
    isClubMember 
  } = useBookClubs();
  
  // Bestimme, welche Lesegruppen angezeigt werden sollen
  let displayedClubs = variant === 'joined' ? userClubs : bookClubs;
  
  // Filtere nach Suchbegriff
  if (searchTerm) {
    displayedClubs = searchBookClubs(searchTerm);
  }
  
  // Begrenze die Anzahl der angezeigten Clubs wenn limit gesetzt ist
  if (limit && displayedClubs.length > limit) {
    displayedClubs = displayedClubs.slice(0, limit);
  }
  
  const handleJoinClub = (clubId: string) => {
    const success = joinBookClub(clubId);
    
    if (success) {
      toast({
        title: language === 'de' ? 'Lesegruppe beigetreten' : 'Joined book club',
        description: language === 'de' 
          ? 'Du bist der Lesegruppe erfolgreich beigetreten' 
          : 'You have successfully joined the book club',
      });
    }
  };
  
  const handleClubClick = (club: BookClub) => {
    navigate(`/bookclubs/${club.id}`);
  };
  
  const emptyStateMessage = variant === 'joined'
    ? (language === 'de' ? 'Du bist noch keiner Lesegruppe beigetreten' : 'You haven\'t joined any book clubs yet')
    : (language === 'de' ? 'Keine Lesegruppen gefunden' : 'No book clubs found');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {variant === 'joined' 
            ? (language === 'de' ? 'Meine Lesegruppen' : 'My Book Clubs')
            : (language === 'de' ? 'Alle Lesegruppen' : 'All Book Clubs')
          }
        </h2>
        <Button 
          onClick={() => navigate('/bookclubs/new')}
          className="gap-1"
        >
          <Plus size={16} />
          {language === 'de' ? 'Neue Gruppe' : 'New Club'}
        </Button>
      </div>
      
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={language === 'de' ? "Lesegruppen durchsuchen..." : "Search book clubs..."}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {displayedClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedClubs.map(club => (
            <BookClubCard
              key={club.id}
              club={club}
              onClick={() => handleClubClick(club)}
              onJoin={() => handleJoinClub(club.id)}
              isMember={isClubMember(club.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto rounded-full bg-muted p-3 w-12 h-12 flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4">
              {language === 'de' ? 'Keine Lesegruppen gefunden' : 'No book clubs found'}
            </CardTitle>
            <CardDescription>
              {emptyStateMessage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/bookclubs/new')}
              variant="default"
              className="gap-1"
            >
              <Plus size={16} />
              {language === 'de' ? 'Neue Lesegruppe erstellen' : 'Create a book club'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {variant === 'all' && !limit && displayedClubs.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/bookclubs')}
          >
            {language === 'de' ? 'Alle Lesegruppen anzeigen' : 'View all book clubs'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookClubsList;
