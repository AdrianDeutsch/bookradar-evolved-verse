
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { storage } from '@/utils/localStorage';
import { BookOpen, Moon, Sun, BookmarkIcon, X, Maximize2, Minimize2, Home } from 'lucide-react';
import { getBookDetails } from '@/services/bookService';
import { useQuery } from '@tanstack/react-query';

interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastRead: string;
}

interface BookContent {
  title: string;
  content: string[];  // Changed to array of strings for multi-page support
  author: string;
}

const ReadingMode = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16); // In pixels
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [bookContent, setBookContent] = useState<BookContent>({
    title: '',
    content: [''],
    author: ''
  });
  const [currentPageContent, setCurrentPageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<ReadingProgress>({
    bookId: id || '',
    currentPage: 1,
    totalPages: 1,
    percentage: 0,
    lastRead: new Date().toISOString()
  });

  // Fetch book details to get title and author
  const { data: bookDetails, isLoading: isLoadingBookDetails } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookDetails(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Load page content based on current page
  useEffect(() => {
    if (bookContent.content.length > 0 && progress.currentPage <= bookContent.content.length) {
      setCurrentPageContent(bookContent.content[progress.currentPage - 1]);
    }
  }, [bookContent.content, progress.currentPage]);

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
              totalPages: 1,  // Will be updated when content is fetched
              percentage: 0,
              lastRead: new Date().toISOString()
            });
          }
        }

        // Get book details for content
        let title = 'Book';
        let author = 'Unknown Author';
        
        if (bookDetails) {
          title = bookDetails.title || 'Book';
          author = bookDetails.author || 'Unknown Author';
        }

        // In a real app, we would fetch the actual book content from an API
        // Since we don't have that, we'll use the book ID to determine content
        let content: string[] = [];
        
        // Generate dynamic content based on book ID to simulate different books
        if (id?.includes('OL')) {
          // OpenLibrary ID - Simulate content from "1984"
          content = [
            `<h1>${title}</h1>
            <h2>by ${author}</h2>
            <p class="chapter">CHAPTER I.</p>
            <p>It was a bright day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.</p>
            <p>The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.</p>`,
            
            `<p class="chapter">CHAPTER I. (continued)</p>
            <p>Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours. It was part of the economy drive in preparation for Hate Week. The flat was seven flights up, and Winston, who was thirty-nine and had a varicose ulcer above his right ankle, went slowly, resting several times on the way.</p>
            <p>On each landing, opposite the lift-shaft, the poster with the enormous face gazed from the wall. It was one of those pictures which are so contrived that the eyes follow you about when you move. BIG BROTHER IS WATCHING YOU, the caption beneath it ran.</p>`,
            
            `<p class="chapter">CHAPTER II.</p>
            <p>As he put his hand to the door-knob Winston saw that he had left the diary open on the table. DOWN WITH BIG BROTHER was written all over it, in letters almost big enough to be legible across the room. It was an inconceivably stupid thing to have done. But, he realized, even in his panic he had not wanted to smudge the creamy paper by shutting the book while the ink was wet.</p>`
          ];
        } else if (id?.includes('harry') || id?.includes('potter')) {
          // Harry Potter related
          content = [
            `<h1>${title}</h1>
            <h2>by ${author}</h2>
            <p class="chapter">CHAPTER ONE - THE BOY WHO LIVED</p>
            <p>Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.</p>
            <p>Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.</p>`,
            
            `<p class="chapter">CHAPTER ONE (continued)</p>
            <p>The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere.</p>
            <p>The Dursleys had everything they wanted, but they also had a secret, and their greatest fear was that somebody would discover it. They didn't think they could bear it if anyone found out about the Potters. Mrs. Potter was Mrs. Dursley's sister, but they hadn't met for several years; in fact, Mrs. Dursley pretended she didn't have a sister, because her sister and her good-for-nothing husband were as unDursleyish as it was possible to be.</p>`,
            
            `<p class="chapter">CHAPTER TWO - THE VANISHING GLASS</p>
            <p>Nearly ten years had passed since the Dursleys had woken up to find their nephew on the front step, but Privet Drive had hardly changed at all. The sun rose on the same tidy front gardens and lit up the brass number four on the Dursleys' front door; it crept into their living room, which was almost exactly the same as it had been on the night when Mr. Dursley had seen that fateful news report about the owls.</p>`
          ];
        } else {
          // Default - Generate content based on book ID to ensure uniqueness
          content = [
            `<h1>${title}</h1>
            <h2>by ${author}</h2>
            <p class="chapter">CHAPTER I. Down the Rabbit-Hole</p>
            <p>Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'</p>
            <p>So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.</p>`,
            
            `<p class="chapter">CHAPTER I. (continued)</p>
            <p>There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it.</p>`,
            
            `<p class="chapter">CHAPTER II. The Pool of Tears</p>
            <p>'Curiouser and curiouser!' cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); 'now I'm opening out like the largest telescope that ever was! Good-bye, feet!' (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).</p>`
          ];
        }
        
        setBookContent({
          title: title,
          content: content,
          author: author
        });
        
        // Update total pages based on content length
        setProgress(prev => ({
          ...prev,
          totalPages: content.length,
          currentPage: Math.min(prev.currentPage, content.length || 1),
          percentage: content.length ? Math.round((Math.min(prev.currentPage, content.length) / content.length) * 100) : 0
        }));
        
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
  }, [id, toast, language, bookDetails]);

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
    const totalPages = bookContent.content.length || 1;
    const currentPage = Math.max(1, Math.min(Math.round((percentage / 100) * totalPages), totalPages));
    
    setProgress({
      ...progress,
      currentPage,
      totalPages,
      percentage,
      lastRead: new Date().toISOString()
    });
    
    toast({
      title: language === 'de' ? 'Fortschritt gespeichert' : 'Progress saved',
      description: `${currentPage} / ${totalPages}`,
    });
  };

  const nextPage = () => {
    if (progress.currentPage < progress.totalPages) {
      const newPage = progress.currentPage + 1;
      const newPercentage = Math.min(100, Math.round((newPage / progress.totalPages) * 100));
      
      setProgress({
        ...progress,
        currentPage: newPage,
        percentage: newPercentage,
        lastRead: new Date().toISOString()
      });
    }
  };

  const previousPage = () => {
    if (progress.currentPage > 1) {
      const newPage = progress.currentPage - 1;
      const newPercentage = Math.max(0, Math.round((newPage / progress.totalPages) * 100));
      
      setProgress({
        ...progress,
        currentPage: newPage,
        percentage: newPercentage,
        lastRead: new Date().toISOString()
      });
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

  if (isLoading || isLoadingBookDetails) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Card className={`w-full max-w-4xl mx-auto border-0 shadow-none ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 z-10 bg-inherit">
          <div className="flex items-center gap-2">
            <Link to={`/book/${id}`} className="p-2 rounded-full hover:bg-muted transition-colors">
              <X className="h-5 w-5" aria-label={language === 'de' ? 'Schließen' : 'Close'} />
            </Link>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className={`h-5 w-5 ${isDarkMode ? 'text-slate-300' : 'text-primary'}`} />
              {language === 'de' ? 'Lesemodus' : 'Reading Mode'}
            </CardTitle>
          </div>
          
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
            
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                {language === 'de' ? 'Zur Startseite' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 md:px-12 lg:px-24">
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
            dangerouslySetInnerHTML={{ __html: currentPageContent }}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 sticky bottom-0 bg-inherit pt-4 pb-6">
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
