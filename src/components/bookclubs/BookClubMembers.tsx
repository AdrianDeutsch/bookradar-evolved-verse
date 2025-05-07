
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LocalUser } from '@/hooks/useBookClubs';
import { Skeleton } from '@/components/ui/skeleton';

interface BookClubMembersProps {
  members: string[];
  currentUser: LocalUser;
  isLoading?: boolean;
}

const BookClubMembers = ({ members, currentUser, isLoading = false }: BookClubMembersProps) => {
  const { language } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="mt-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array(3).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">
        {language === 'de' ? 'Mitglieder' : 'Members'}
        <span className="text-sm font-normal text-muted-foreground ml-2">
          ({members.length})
        </span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {members.map((memberId, index) => (
          <div 
            key={memberId} 
            className="flex items-center gap-2 border rounded-full px-3 py-1 bg-background hover:bg-accent/10 transition-colors"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {memberId === currentUser.id 
                  ? currentUser.name.charAt(0).toUpperCase()
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
  );
};

export default BookClubMembers;
