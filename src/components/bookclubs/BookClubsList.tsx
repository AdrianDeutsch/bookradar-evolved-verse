
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookClubs, BookClub } from '@/hooks/useBookClubs';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookClubCard from './BookClubCard';

interface BookClubsListProps {
  variant?: 'all' | 'joined';
  limit?: number;
  searchQuery?: string;
}

const BookClubsList: React.FC<BookClubsListProps> = ({ 
  variant = 'all',
  limit,
  searchQuery = ''
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState<string | null>(null);
  
  const { 
    bookClubs, 
    userClubs, 
    searchBookClubs, 
    joinBookClub,
    isClubMember 
  } = useBookClubs();
  
  // Determine which book clubs to display
  let displayedClubs = variant === 'joined' ? userClubs : bookClubs;
  
  // Filter by search term
  if (searchQuery) {
    displayedClubs = searchBookClubs(searchQuery);
    
    // If on "joined" tab, only show joined clubs that match search
    if (variant === 'joined') {
      displayedClubs = displayedClubs.filter(club => isClubMember(club.id));
    }
  }
  
  // Limit the number of displayed clubs if limit is set
  if (limit && displayedClubs.length > limit) {
    displayedClubs = displayedClubs.slice(0, limit);
  }
  
  const handleJoinClub = async (clubId: string) => {
    setIsJoining(clubId);
    
    try {
      const success = joinBookClub(clubId);
      
      if (success) {
        toast({
          title: language === 'de' ? 'Lesegruppe beigetreten' : 'Joined book club',
          description: language === 'de' 
            ? 'Du bist der Lesegruppe erfolgreich beigetreten' 
            : 'You have successfully joined the book club',
        });
      } else {
        toast({
          title: language === 'de' ? 'Fehler' : 'Error',
          description: language === 'de' 
            ? 'Beitritt zur Lesegruppe fehlgeschlagen' 
            : 'Failed to join the book club',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error joining club:", error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: String(error) || (language === 'de' 
          ? 'Unbekannter Fehler beim Beitritt' 
          : 'Unknown error while joining'),
        variant: "destructive"
      });
    } finally {
      setIsJoining(null);
    }
  };
  
  const handleClubClick = (club: BookClub) => {
    navigate(`/bookclubs/${club.id}`);
  };
  
  const emptyStateMessage = variant === 'joined'
    ? (language === 'de' ? 'Du bist noch keiner Lesegruppe beigetreten' : 'You haven\'t joined any book clubs yet')
    : (language === 'de' ? 'Keine Lesegruppen gefunden' : 'No book clubs found');
  
  return (
    <div className="space-y-6">
      {displayedClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedClubs.map(club => (
            <BookClubCard
              key={club.id}
              club={club}
              onClick={() => handleClubClick(club)}
              onJoin={() => handleJoinClub(club.id)}
              isMember={isClubMember(club.id)}
              isJoining={isJoining === club.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-background/50">
          <div className="mx-auto rounded-full bg-muted p-3 w-12 h-12 flex items-center justify-center">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">
            {language === 'de' ? 'Keine Lesegruppen gefunden' : 'No book clubs found'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {emptyStateMessage}
          </p>
          {variant === 'joined' && (
            <Button
              onClick={() => navigate('/bookclubs')}
              variant="outline"
              className="mt-6"
            >
              {language === 'de' ? 'Alle Lesegruppen anzeigen' : 'View all book clubs'}
            </Button>
          )}
          {variant === 'all' && searchQuery && (
            <Button
              onClick={() => navigate('/bookclubs')}
              variant="outline"
              className="mt-6"
            >
              {language === 'de' ? 'Suche zurücksetzen' : 'Clear search'}
            </Button>
          )}
          {variant === 'all' && !searchQuery && (
            <Button
              onClick={() => navigate('/bookclubs/new')}
              variant="default"
              className="mt-6 gap-1"
            >
              <Plus size={16} />
              {language === 'de' ? 'Erste Lesegruppe erstellen' : 'Create first book club'}
            </Button>
          )}
        </div>
      )}
      
      {variant === 'all' && limit && displayedClubs.length > 0 && displayedClubs.length === limit && (
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
