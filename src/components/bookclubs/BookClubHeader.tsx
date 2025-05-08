
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { BookClub } from '@/hooks/useBookClubs';
import { Badge } from '@/components/ui/badge';
import { Users, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BookClubHeaderProps {
  club: BookClub;
  isAdmin: boolean;
  isLoading?: boolean;
}

const BookClubHeader = ({ club, isAdmin, isLoading = false }: BookClubHeaderProps) => {
  const { language } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="relative h-48 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500/50 to-purple-600/50 animate-pulse">
        <div className="absolute inset-0 bg-black/20 p-6 flex flex-col justify-end">
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    );
  }
  
  return (
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
          <span>
            {club.members.length} 
            {language === 'de' ? ' Mitglieder' : ' Members'}
          </span>
        </div>
      </div>
      
      {isAdmin && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="flex gap-1 items-center">
            <Settings className="h-3 w-3" />
            {language === 'de' ? 'Admin' : 'Admin'}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default BookClubHeader;
