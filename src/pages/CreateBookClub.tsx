
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useBookClubs } from '@/hooks/useBookClubs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CreateBookClub = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { createBookClub } = useBookClubs();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de' 
          ? 'Bitte gib einen Namen für die Lesegruppe an' 
          : 'Please provide a name for the book club',
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newClub = createBookClub(
        name.trim(),
        description.trim(),
        imageUrl.trim() || undefined
      );
      
      toast({
        title: language === 'de' ? 'Lesegruppe erstellt' : 'Book club created',
        description: language === 'de'
          ? `"${name}" wurde erfolgreich erstellt`
          : `"${name}" has been successfully created`
      });
      
      // Zur neuen Lesegruppe navigieren
      navigate(`/bookclubs/${newClub.id}`);
    } catch (error) {
      console.error('Error creating book club:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Beim Erstellen der Lesegruppe ist ein Fehler aufgetreten'
          : 'An error occurred while creating the book club',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/bookclubs')}
          className="mb-4"
        >
          ← {language === 'de' ? 'Zurück zu Lesegruppen' : 'Back to Book Clubs'}
        </Button>
        
        <h1 className="text-3xl font-bold">
          {language === 'de' ? 'Neue Lesegruppe erstellen' : 'Create New Book Club'}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'de' ? 'Gruppendetails' : 'Club Details'}
            </CardTitle>
            <CardDescription>
              {language === 'de' 
                ? 'Fülle die folgenden Informationen aus, um eine neue Lesegruppe zu erstellen'
                : 'Fill out the following information to create a new book club'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {language === 'de' ? 'Gruppenname' : 'Club Name'} *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'de' ? 'z.B. Sci-Fi Liebhaber' : 'e.g. Sci-Fi Lovers'}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">
                  {language === 'de' ? 'Beschreibung' : 'Description'}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'de' 
                    ? 'Worum geht es in deiner Lesegruppe?'
                    : 'What is your book club about?'}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">
                  {language === 'de' ? 'Bild-URL (optional)' : 'Image URL (optional)'}
                </Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'de'
                    ? 'Füge die URL eines Bildes hinzu, das deine Gruppe repräsentiert'
                    : 'Add the URL of an image that represents your group'}
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/bookclubs')}
                  disabled={isLoading}
                >
                  {language === 'de' ? 'Abbrechen' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                >
                  {isLoading 
                    ? (language === 'de' ? 'Wird erstellt...' : 'Creating...')
                    : (language === 'de' ? 'Lesegruppe erstellen' : 'Create Book Club')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateBookClub;
