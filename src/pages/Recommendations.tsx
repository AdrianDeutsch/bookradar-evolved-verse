
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import BookCard from '@/components/books/BookCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, BarChart2, Clock, Coffee, Book, Sun, Moon, Star } from 'lucide-react';

const Recommendations = () => {
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  // Sample mood categories and their books
  const moodCategories = [
    { id: 'happy', icon: <Sun className="h-5 w-5" />, label: t('language') === 'de' ? 'Fröhlich' : 'Happy' },
    { id: 'thoughtful', icon: <Coffee className="h-5 w-5" />, label: t('language') === 'de' ? 'Nachdenklich' : 'Thoughtful' },
    { id: 'exciting', icon: <Star className="h-5 w-5" />, label: t('language') === 'de' ? 'Aufregend' : 'Exciting' },
    { id: 'relaxing', icon: <Moon className="h-5 w-5" />, label: t('language') === 'de' ? 'Entspannend' : 'Relaxing' },
    { id: 'educational', icon: <Book className="h-5 w-5" />, label: t('language') === 'de' ? 'Lehrreich' : 'Educational' },
    { id: 'quick', icon: <Clock className="h-5 w-5" />, label: t('language') === 'de' ? 'Schnell lesbar' : 'Quick Read' },
  ];
  
  // Sample recommended books based on mood
  const moodBooks = {
    happy: [
      { id: '1', title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', coverUrl: 'https://covers.openlibrary.org/b/id/8816862-M.jpg', rating: 4.7 },
      { id: '2', title: 'Good Omens', author: 'Terry Pratchett & Neil Gaiman', coverUrl: 'https://covers.openlibrary.org/b/id/9251896-M.jpg', rating: 4.5 },
      { id: '3', title: 'The Princess Bride', author: 'William Goldman', coverUrl: 'https://covers.openlibrary.org/b/id/8231522-M.jpg', rating: 4.3 }
    ],
    thoughtful: [
      { id: '4', title: 'Siddhartha', author: 'Hermann Hesse', coverUrl: 'https://covers.openlibrary.org/b/id/12746999-M.jpg', rating: 4.2 },
      { id: '5', title: 'Man\'s Search for Meaning', author: 'Viktor E. Frankl', coverUrl: 'https://covers.openlibrary.org/b/id/8309647-M.jpg', rating: 4.9 },
      { id: '6', title: 'The Alchemist', author: 'Paulo Coelho', coverUrl: 'https://covers.openlibrary.org/b/id/8587183-M.jpg', rating: 4.6 }
    ],
    exciting: [
      { id: '7', title: 'The Hunger Games', author: 'Suzanne Collins', coverUrl: 'https://covers.openlibrary.org/b/id/6943648-M.jpg', rating: 4.5 },
      { id: '8', title: 'Ready Player One', author: 'Ernest Cline', coverUrl: 'https://covers.openlibrary.org/b/id/10389354-M.jpg', rating: 4.4 },
      { id: '9', title: 'The Martian', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/id/9254653-M.jpg', rating: 4.7 }
    ],
    relaxing: [
      { id: '10', title: 'Under the Tuscan Sun', author: 'Frances Mayes', coverUrl: 'https://covers.openlibrary.org/b/id/8240830-M.jpg', rating: 4.0 },
      { id: '11', title: 'A Year in Provence', author: 'Peter Mayle', coverUrl: 'https://covers.openlibrary.org/b/id/8410645-M.jpg', rating: 4.2 },
      { id: '12', title: 'The Secret Garden', author: 'Frances Hodgson Burnett', coverUrl: 'https://covers.openlibrary.org/b/id/10452512-M.jpg', rating: 4.3 }
    ],
    educational: [
      { id: '13', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: 'https://covers.openlibrary.org/b/id/10761814-M.jpg', rating: 4.8 },
      { id: '14', title: 'Cosmos', author: 'Carl Sagan', coverUrl: 'https://covers.openlibrary.org/b/id/8301883-M.jpg', rating: 4.9 },
      { id: '15', title: 'Guns, Germs, and Steel', author: 'Jared Diamond', coverUrl: 'https://covers.openlibrary.org/b/id/8683146-M.jpg', rating: 4.5 }
    ],
    quick: [
      { id: '16', title: 'Animal Farm', author: 'George Orwell', coverUrl: 'https://covers.openlibrary.org/b/id/9176167-M.jpg', rating: 4.4 },
      { id: '17', title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', coverUrl: 'https://covers.openlibrary.org/b/id/7895100-M.jpg', rating: 4.7 },
      { id: '18', title: 'Of Mice and Men', author: 'John Steinbeck', coverUrl: 'https://covers.openlibrary.org/b/id/8442786-M.jpg', rating: 4.3 }
    ]
  };

  const getMoodBooks = (mood: string) => {
    return (moodBooks as any)[mood] || [];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('recommendations')}</h1>
          <p className="text-muted-foreground">
            {t('language') === 'de'
              ? 'Entdecke Bücher basierend auf deiner Stimmung'
              : 'Discover books based on your mood'}
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {t('language') === 'de' ? 'Wähle deine Stimmung' : 'Choose your mood'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {moodCategories.map(mood => (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? "default" : "outline"}
                  className="h-auto flex flex-col py-4 px-2 space-y-2"
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <div className="h-8 w-8 flex items-center justify-center">
                    {mood.icon}
                  </div>
                  <span>{mood.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {selectedMood && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {t('language') === 'de' ? 'Basierend auf deiner Stimmung' : 'Based on your mood'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getMoodBooks(selectedMood).map((book: any) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverUrl={book.coverUrl}
                  rating={book.rating}
                />
              ))}
            </div>
          </div>
        )}
        
        {!selectedMood && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('language') === 'de' 
                ? 'Wähle eine Stimmung, um Buchempfehlungen zu erhalten' 
                : 'Choose a mood to get book recommendations'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recommendations;
