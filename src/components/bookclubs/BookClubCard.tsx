
import React from 'react';
import { BookClub } from '@/hooks/useBookClubs';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Book, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface BookClubCardProps {
  club: BookClub;
  onClick: () => void;
  onJoin: () => void;
  isMember: boolean;
}

const BookClubCard: React.FC<BookClubCardProps> = ({ club, onClick, onJoin, isMember }) => {
  const { language } = useLanguage();
  
  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: language === 'de' ? de : undefined
    });
  };
  
  // Placeholder image, wenn keine URL vorhanden
  const cardImage = club.imageUrl || 'https://via.placeholder.com/300x150?text=Book+Club';

  return (
    <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer h-full flex flex-col">
      <div 
        className="h-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${cardImage})` }}
        onClick={onClick}
      >
        <div className="w-full h-full bg-black/30 p-3 flex items-end">
          <Badge variant="secondary" className="opacity-90">
            {club.members.length} {language === 'de' ? 'Mitglieder' : 'Members'}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2" onClick={onClick}>
        <CardTitle className="line-clamp-1">{club.name}</CardTitle>
        <CardDescription className="text-xs">
          {language === 'de' ? 'Erstellt' : 'Created'} {formatDate(club.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-1" onClick={onClick}>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {club.description}
        </p>
        
        {club.currentBookId && (
          <div className="mt-3 flex items-center text-sm">
            <Book className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground line-clamp-1">
              {language === 'de' ? 'Aktuelles Buch' : 'Current book'}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isMember ? (
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={onClick}
          >
            <span>{language === 'de' ? 'Öffnen' : 'Open'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="w-full gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
          >
            <Users className="h-4 w-4" />
            {language === 'de' ? 'Beitreten' : 'Join'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookClubCard;
