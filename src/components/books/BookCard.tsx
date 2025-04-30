
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookOpen, Heart, BookmarkPlus, Share2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating?: number;
  progress?: number;
}

const BookCard = ({ id, title, author, coverUrl, rating, progress }: BookCardProps) => {
  const { t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? t('success') : t('success'),
      description: !isFavorite 
        ? `"${title}" ${t('addToFavorites').toLowerCase()}` 
        : `"${title}" aus Favoriten entfernt`,
      duration: 3000,
    });
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsInWishlist(!isInWishlist);
    toast({
      title: t('success'),
      description: !isInWishlist 
        ? `"${title}" ${t('addToWishlist').toLowerCase()}` 
        : `"${title}" aus Wunschliste entfernt`,
      duration: 3000,
    });
  };

  const shareBook = (e: React.MouseEvent) => {
    e.preventDefault();
    // Implement sharing functionality
    toast({
      title: t('share'),
      description: `${t('shareBook')}: "${title}"`,
      duration: 3000,
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Create a nice background color based on title for the placeholder
  const getColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Use pastel colors for better aesthetics
    const hue = ((hash & 0xFFFFFF) % 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  // For placeholder, create a truncated title that fits well
  const truncatedTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;

  return (
    <Link to={`/book/${id}`} className="h-full">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in">
        <div className="relative aspect-[2/3] overflow-hidden">
          {coverUrl && !imageError ? (
            <img 
              src={coverUrl} 
              alt={title} 
              className="object-cover w-full h-full book-cover" 
              loading="lazy"
              onError={handleImageError}
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
              style={{ backgroundColor: getColorFromString(title) }}
            >
              <Book className="h-12 w-12 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-foreground">{truncatedTitle}</span>
            </div>
          )}
          
          {rating && (
            <div className="absolute top-2 right-2 bg-bookradar-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {rating}
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold leading-tight line-clamp-2 mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{author}</p>
          
          {typeof progress === 'number' && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {t('language') === 'de' ? 'Fortschritt' : 'Progress'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-2 pt-0 flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleFavorite} className="hover:text-bookradar-primary">
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-bookradar-primary text-bookradar-primary' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('addToFavorites')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleWishlist} className="hover:text-bookradar-primary">
                  <BookmarkPlus className={`h-4 w-4 ${isInWishlist ? 'fill-bookradar-primary text-bookradar-primary' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('addToWishlist')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={shareBook} className="hover:text-bookradar-primary">
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('shareBook')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:text-bookradar-primary">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('startReading')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BookCard;
