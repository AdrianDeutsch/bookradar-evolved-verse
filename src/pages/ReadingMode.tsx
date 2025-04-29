
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book, ArrowLeft, Moon, Sun, BookOpen, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { storage } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

interface ReadingBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  currentPage: number;
  totalPages: number;
}

const ReadingMode = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [book, setBook] = useState<ReadingBook | null>(null);
  const [fontSize, setFontSize] = useState<number>(() => storage.get('bookradar-reading-font-size', 16));
  const [lineHeight, setLineHeight] = useState<number>(() => storage.get('bookradar-reading-line-height', 1.5));
  const [progress, setProgress] = useState<number>(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // Get book from storage or fetch if not available
    const storedBook = storage.get<ReadingBook>('bookradar-reading-book', null);
    
    if (storedBook && storedBook.id === id) {
      setBook(storedBook);
      const progressPercent = Math.round((storedBook.currentPage / storedBook.totalPages) * 100);
      setProgress(progressPercent);
    } else {
      // Fetch book details if not in storage
      // Here we would ideally fetch the book content as well
      // For now, we'll use a placeholder and redirect to the book details
      toast({
        title: t('error'),
        description: t('language') === 'de' 
          ? 'Buch nicht im Lesemodus verfügbar. Bitte wähle es erneut aus.'
          : 'Book not available in reading mode. Please select it again.',
        variant: 'destructive',
      });
      setTimeout(() => {
        window.location.href = `/book/${id}`;
      }, 2000);
    }

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [id, t]);

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    storage.set('bookradar-reading-font-size', newSize);
  };

  // Handle line height change
  const handleLineHeightChange = (value: number[]) => {
    const newHeight = value[0];
    setLineHeight(newHeight);
    storage.set('bookradar-reading-line-height', newHeight);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast({
          title: t('error'),
          description: t('language') === 'de'
            ? 'Vollbildmodus konnte nicht aktiviert werden.'
            : 'Could not enter fullscreen mode.',
          variant: 'destructive',
        });
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Toggle dark/light mode
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Update reading progress
  const updateProgress = (newPage: number) => {
    if (!book) return;
    
    const newProgress = Math.round((newPage / book.totalPages) * 100);
    setProgress(newProgress);
    
    // Update book in storage
    const updatedBook = { ...book, currentPage: newPage };
    setBook(updatedBook);
    storage.set('bookradar-reading-book', updatedBook);
    storage.set(`bookradar-reading-progress-${book.id}`, newPage);

    // Show toast for significant progress milestones
    if (newProgress % 25 === 0) {
      toast({
        title: t('progress'),
        description: `${newProgress}% ${t('language') === 'de' ? 'gelesen' : 'completed'}!`,
      });
    }
  };

  // When user presses space, go to next page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && book) {
        e.preventDefault();
        const newPage = Math.min(book.currentPage + 1, book.totalPages);
        updateProgress(newPage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [book]);

  // Toggle reading controls visibility on mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (fullscreen) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [fullscreen]);

  // Simulated book content for demo
  const bookContent = `
    <h1>Chapter 1</h1>
    <p>The beginning of a great adventure. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <h2>A New Journey</h2>
    <p>She had been waiting for this moment all her life. The anticipation was almost unbearable as she stepped toward the door that would change everything. Her heart pounded in her chest, each beat a reminder of what was at stake.</p>
    <p>"Are you ready?" a voice called from behind her. She turned to see her companion, eyes bright with excitement and a hint of fear.</p>
    <p>"As ready as I'll ever be," she replied, taking a deep breath before pushing the heavy door open.</p>
  `;

  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <Book className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {t('language') === 'de' ? 'Lade Buch...' : 'Loading book...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${fullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}
      style={{ 
        transitionProperty: "background-color", 
        transitionDuration: "500ms" 
      }}
    >
      {/* Reading controls - shown based on showControls state */}
      <div 
        className={`${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-300 fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-background/90 to-transparent p-4`}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to={`/book/${book.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="hidden md:block">
              <h2 className="font-semibold">{book.title}</h2>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={fullscreen ? t('exitFullscreen') : t('enterFullscreen')}
            >
              {fullscreen ? <X className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto mt-4">
          <Progress value={progress} className="h-1" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{t('page')} {book.currentPage} {t('of')} {book.totalPages}</span>
            <span>{progress}% {t('complete')}</span>
          </div>
        </div>
      </div>
      
      {/* Reading settings panel - shown when controls are visible */}
      <div 
        className={`${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-300 fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-background/90 to-transparent p-4`}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm w-24">{t('fontSize')}</span>
            <Slider
              value={[fontSize]}
              min={12}
              max={24}
              step={1}
              onValueChange={handleFontSizeChange}
              className="flex-1"
            />
            <span className="text-sm w-6">{fontSize}px</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm w-24">{t('lineHeight')}</span>
            <Slider
              value={[lineHeight * 10]}
              min={10}
              max={25}
              step={1}
              onValueChange={(val) => handleLineHeightChange([val[0] / 10])}
              className="flex-1"
            />
            <span className="text-sm w-6">{lineHeight.toFixed(1)}</span>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={book.currentPage <= 1}
              onClick={() => updateProgress(book.currentPage - 1)}
            >
              {t('previousPage')}
            </Button>
            
            <Button
              variant="outline" 
              disabled={book.currentPage >= book.totalPages}
              onClick={() => updateProgress(book.currentPage + 1)}
            >
              {t('nextPage')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Book content area */}
      <div 
        className={`mx-auto p-6 pt-24 pb-32 max-w-3xl lg:max-w-4xl`}
        style={{ 
          fontSize: `${fontSize}px`, 
          lineHeight: lineHeight,
          userSelect: 'none' // Prevent text selection
        }}
      >
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: bookContent }}
        />
      </div>
    </div>
  );
};

export default ReadingMode;
