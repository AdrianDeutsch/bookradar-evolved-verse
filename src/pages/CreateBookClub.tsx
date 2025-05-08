
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useBookClubs } from '@/hooks/useBookClubs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, BookText, Image } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CreateBookClub = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { createBookClub } = useBookClubs();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError(language === 'de' 
        ? 'Bitte gib einen Namen für die Lesegruppe an' 
        : 'Please provide a name for the book club');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Validate image URL if provided
      if (imageUrl && !imageUrl.match(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i)) {
        throw new Error(language === 'de'
          ? 'Bitte gib eine gültige Bild-URL ein (z.B. https://example.com/image.jpg)'
          : 'Please enter a valid image URL (e.g., https://example.com/image.jpg)');
      }
      
      const newClub = await createBookClub(
        name.trim(),
        description.trim(),
        imageUrl.trim() || undefined
      );
      
      if (!newClub) {
        throw new Error(language === 'de'
          ? 'Die Lesegruppe konnte nicht erstellt werden'
          : 'Failed to create the book club');
      }
      
      toast({
        title: language === 'de' ? 'Lesegruppe erstellt' : 'Book club created',
        description: language === 'de'
          ? `"${name}" wurde erfolgreich erstellt`
          : `"${name}" has been successfully created`
      });
      
      // Navigate to the new book club
      navigate(`/bookclubs/${newClub.id}`);
    } catch (err) {
      console.error('Error creating book club:', err);
      setError(err instanceof Error ? err.message : 
        language === 'de'
          ? 'Beim Erstellen der Lesegruppe ist ein Fehler aufgetreten'
          : 'An error occurred while creating the book club');
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
          className="mb-4 gap-2"
        >
          <ArrowLeft size={16} />
          {language === 'de' ? 'Zurück zu Lesegruppen' : 'Back to Book Clubs'}
        </Button>
        
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookText className="h-8 w-8" />
          {language === 'de' ? 'Neue Lesegruppe erstellen' : 'Create New Book Club'}
        </h1>
        
        <Card>
          <form onSubmit={handleSubmit}>
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
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
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
                  maxLength={50}
                  className={!name.trim() ? "border-destructive" : ""}
                />
                {!name.trim() && (
                  <p className="text-xs text-destructive">
                    {language === 'de' ? 'Pflichtfeld' : 'Required field'}
                  </p>
                )}
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
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 {language === 'de' ? 'Zeichen' : 'characters'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
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
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4">
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'de' ? 'Wird erstellt...' : 'Creating...'}
                  </>
                ) : (
                  language === 'de' ? 'Lesegruppe erstellen' : 'Create Book Club'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateBookClub;
