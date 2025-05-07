
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useBookClubs } from '@/hooks/useBookClubs';
import { Button } from '@/components/ui/button';
import { UserMinus, Loader2 } from 'lucide-react';

interface BookClubActionsProps {
  clubId: string;
  isMember: boolean;
}

const BookClubActions = ({ clubId, isMember }: BookClubActionsProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { leaveBookClub } = useBookClubs();
  const [leavingGroup, setLeavingGroup] = useState(false);
  
  const handleLeaveClub = async () => {
    if (!clubId) return;
    
    setLeavingGroup(true);
    
    try {
      const success = leaveBookClub(clubId);
      
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

  return (
    <>
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
    </>
  );
};

export default BookClubActions;
