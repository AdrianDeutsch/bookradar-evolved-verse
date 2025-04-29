
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { storage } from '@/utils/localStorage';
import { BookOpenText, Moon, Sun, BookUp, X, Maximize2, Minimize2, BookmarkIcon } from 'lucide-react';

interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastRead: string;
}

const ReadingMode = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16); // In pixels
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<ReadingProgress>({
    bookId: id || '',
    currentPage: 1,
    totalPages: 100,
    percentage: 0,
    lastRead: new Date().toISOString()
  });

  useEffect(() => {
    const fetchBookContent = async () => {
      setIsLoading(true);
      
      try {
        // Try to load reading progress from localStorage
        if (id) {
          const savedProgress = storage.get<ReadingProgress | null>(`bookradar-reading-progress-${id}`, null);
          
          if (savedProgress) {
            setProgress(savedProgress);
          } else {
            // Initialize new progress
            setProgress({
              bookId: id,
              currentPage: 1,
              totalPages: 100,
              percentage: 0,
              lastRead: new Date().toISOString()
            });
          }
        }

        // For demo purposes, we'll use placeholder content 
        // In a real app, you'd fetch this from an API
        setContent(`
          <h1>Alice's Adventures in Wonderland</h1>
          <h2>by Lewis Carroll</h2>
          <p class="chapter">CHAPTER I. Down the Rabbit-Hole</p>
          <p>Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'</p>
          <p>So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.</p>
          <p>There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.</p>
          <p>In another moment down went Alice after it, never once considering how in the world she was to get out again.</p>
        `);
      } catch (error) {
        console.error('Error fetching book content:', error);
        toast({
          title: language === 'de' ? 'Fehler' : 'Error',
          description: language === 'de' 
            ? 'Inhalt konnte nicht geladen werden' 
            : 'Failed to load content',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookContent();
  }, [id, toast, language]);

  // Save progress whenever it changes
  useEffect(() => {
    if (id && progress.bookId === id) {
      storage.set(`bookradar-reading-progress-${id}`, progress);
    }
  }, [id, progress]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast({
          title: language === 'de' ? 'Fehler' : 'Error',
          description: language === 'de' 
            ? 'Vollbildmodus konnte nicht aktiviert werden' 
            : 'Could not enable fullscreen mode',
          variant: 'destructive',
        });
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const updateProgress = (percentage: number) => {
    const currentPage = Math.max(1, Math.round((percentage / 100) * progress.totalPages));
    
    setProgress({
      ...progress,
      currentPage,
      percentage,
      lastRead: new Date().toISOString()
    });
    
    toast({
      title: language === 'de' ? 'Fortschritt gespeichert' : 'Progress saved',
      description: `${currentPage} / ${progress.totalPages}`,
    });
  };

  const nextPage = () => {
    if (progress.currentPage < progress.totalPages) {
      const newPage = progress.currentPage + 1;
      const newPercentage = Math.min(100, Math.round((newPage / progress.totalPages) * 100));
      
      updateProgress(newPercentage);
    }
  };

  const previousPage = () => {
    if (progress.currentPage > 1) {
      const newPage = progress.currentPage - 1;
      const newPercentage = Math.max(0, Math.round((newPage / progress.totalPages) * 100));
      
      updateProgress(newPercentage);
    }
  };

  const bookmarkCurrentPage = () => {
    // In a real app, this would save a bookmark with metadata
    toast({
      title: language === 'de' ? 'Lesezeichen gesetzt' : 'Bookmark added',
      description: language === 'de' 
        ? `Seite ${progress.currentPage}` 
        : `Page ${progress.currentPage}`,
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`transition-colors duration-200 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Card className={`w-full max-w-4xl mx-auto border-0 shadow-none ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpenText className={`h-5 w-5 ${isDarkMode ? 'text-slate-300' : 'text-bookradar-primary'}`} />
            {language === 'de' ? 'Lesemodus' : 'Reading Mode'}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={bookmarkCurrentPage}
              title={language === 'de' ? 'Lesezeichen setzen' : 'Bookmark'}
            >
              <BookmarkIcon className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleFullscreen}
              title={language === 'de' ? 'Vollbild' : 'Fullscreen'}
            >
              {isFullscreen ? 
                <Minimize2 className="h-4 w-4" /> : 
                <Maximize2 className="h-4 w-4" />
              }
            </Button>
            
            <div className="flex items-center space-x-1">
              <Sun className="h-4 w-4" />
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={setIsDarkMode}
                aria-label={language === 'de' ? 'Nachtmodus umschalten' : 'Toggle dark mode'}
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-8 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{language === 'de' ? 'Schriftgröße' : 'Font Size'}</Label>
                <span className="text-sm font-mono">{fontSize}px</span>
              </div>
              <Slider 
                min={12} 
                max={28} 
                step={1} 
                value={[fontSize]} 
                onValueChange={(value) => setFontSize(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{language === 'de' ? 'Zeilenabstand' : 'Line Spacing'}</Label>
                <span className="text-sm font-mono">{lineSpacing.toFixed(1)}</span>
              </div>
              <Slider 
                min={1} 
                max={3} 
                step={0.1} 
                value={[lineSpacing]} 
                onValueChange={(value) => setLineSpacing(value[0])}
              />
            </div>
          </div>
          
          <div 
            className="prose prose-slate max-w-none mx-auto"
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: lineSpacing,
              color: isDarkMode ? '#e2e8f0' : 'inherit'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Progress value={progress.percentage} className="w-full" />
          
          <div className="flex justify-between items-center w-full">
            <div className="text-sm">
              {language === 'de' ? 'Seite' : 'Page'} {progress.currentPage}/{progress.totalPages}
            </div>
            
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={previousPage} 
                disabled={progress.currentPage <= 1}
              >
                {language === 'de' ? 'Zurück' : 'Previous'}
              </Button>
              
              <Button 
                onClick={nextPage} 
                size="sm" 
                disabled={progress.currentPage >= progress.totalPages}
              >
                {language === 'de' ? 'Weiter' : 'Next'}
              </Button>
            </div>
            
            <div className="text-sm text-right">
              {progress.percentage}%
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReadingMode;
