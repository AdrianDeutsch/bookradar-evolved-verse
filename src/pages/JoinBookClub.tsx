
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useBookClubs } from '@/hooks/useBookClubs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Check } from 'lucide-react';

const JoinBookClub = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const { getBookClub, joinBookClub, isClubMember } = useBookClubs();
  
  const club = getBookClub(id || '');
  const isMember = id ? isClubMember(id) : false;

  // Prüfen, ob der Club existiert
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
      return;
    }
    
    // Wenn bereits Mitglied, direkt zur Detailseite navigieren
    if (isMember) {
      navigate(`/bookclubs/${id}`);
    }
  }, [id, club, isMember, navigate, toast, language]);

  const handleJoin = () => {
    if (id) {
      const success = joinBookClub(id);
      
      if (success) {
        toast({
          title: language === 'de' ? 'Lesegruppe beigetreten' : 'Joined book club',
          description: language === 'de'
            ? `Du bist "${club?.name}" erfolgreich beigetreten`
            : `You have successfully joined "${club?.name}"`,
        });
        navigate(`/bookclubs/${id}`);
      } else {
        toast({
          title: language === 'de' ? 'Fehler beim Beitreten' : 'Error joining',
          description: language === 'de'
            ? 'Du konntest dieser Lesegruppe nicht beitreten'
            : 'You could not join this book club',
          variant: "destructive"
        });
      }
    }
  };
  
  if (!club) return null;
  
  return (
    <Layout>
      <div className="max-w-lg mx-auto py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/bookclubs')}
          className="mb-4"
        >
          ← {language === 'de' ? 'Zurück zu Lesegruppen' : 'Back to Book Clubs'}
        </Button>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {language === 'de' ? 'Lesegruppe beitreten' : 'Join Book Club'}
            </CardTitle>
            <CardDescription>
              {language === 'de'
                ? 'Du trittst der folgenden Lesegruppe bei:'
                : 'You are joining the following book club:'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-full p-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{club.name}</h2>
                <p className="text-muted-foreground text-sm">
                  {club.members.length} {language === 'de' ? 'Mitglieder' : 'members'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">
                {language === 'de' ? 'Beschreibung' : 'Description'}
              </h3>
              <p className="text-muted-foreground">{club.description}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/bookclubs')}
            >
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
            <Button
              onClick={handleJoin}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              {language === 'de' ? 'Beitreten' : 'Join'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default JoinBookClub;
