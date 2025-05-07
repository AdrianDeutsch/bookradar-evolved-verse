
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LocalUser } from '@/hooks/useBookClubs';

interface BookClubMembersProps {
  members: string[];
  currentUser: LocalUser;
}

const BookClubMembers = ({ members, currentUser }: BookClubMembersProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">
        {language === 'de' ? 'Mitglieder' : 'Members'}
      </h3>
      <div className="flex flex-wrap gap-2">
        {members.map((memberId, index) => (
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
  );
};

export default BookClubMembers;
