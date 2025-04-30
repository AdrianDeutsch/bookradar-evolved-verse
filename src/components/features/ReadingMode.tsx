
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
  content: string;
  author: string;
}

// Function to fetch book content from Gutendex (Project Gutenberg API)
const fetchGutendexContent = async (title: string, author: string): Promise<string | null> => {
  try {
    // Format search query - Gutendex searches in title and author
    const searchQuery = encodeURIComponent(`${title} ${author}`.trim());
    const response = await fetch(`https://gutendex.com/books/?search=${searchQuery}`);
    
    if (!response.ok) {
      console.error('Gutendex API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Check if we have any results
    if (!data.results || data.results.length === 0) {
      console.log('No books found in Gutendex');
      return null;
    }
    
    // Get the first book result
    const book = data.results[0];
    
    // Check if the book has text formats
    if (book.formats && book.formats['text/html']) {
      try {
        // Try to fetch the actual content
        const contentResponse = await fetch(book.formats['text/html']);
        
        if (!contentResponse.ok) {
          console.error('Failed to fetch book content');
          return null;
        }
        
        const htmlContent = await contentResponse.text();
        // Extract just the body content and clean it up a bit
        return `
          <h1>${book.title}</h1>
          <h2>by ${book.authors.map(a => a.name).join(', ')}</h2>
          <div class="chapter">
            ${extractReadableContent(htmlContent)}
          </div>
        `;
      } catch (error) {
        console.error('Error fetching book content:', error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error with Gutendex API:', error);
    return null;
  }
};

// Helper function to extract readable content from HTML
const extractReadableContent = (html: string): string => {
  // Simple extraction - in a real app you'd use a proper HTML parser
  let content = html;
  
  // Try to extract just the main content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    content = bodyMatch[1];
  }
  
  // Remove scripts and styles
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Get just the first few paragraphs to show as a sample
  const paragraphs = content.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (paragraphs && paragraphs.length > 0) {
    // Get first 10 paragraphs or all if less than 10
    return paragraphs.slice(0, 10).join('\n');
  }
  
  // If we couldn't parse it well, return a shortened version
  return content.substring(0, 3000) + '...';
};

// Fallback content generator based on book metadata
const generateFallbackContent = (title: string, author: string): string => {
  // Generate some sample content based on the book title and author
  return `
    <h1>${title}</h1>
    <h2>by ${author}</h2>
    <p class="chapter">CHAPTER I</p>
    <p>This is a preview of "${title}" by ${author}. The full text is not available in our system at this time.</p>
    <p>In a real application, this would contain the actual book content from an API or database. For now, we're showing this sample text.</p>
    <p>You can use the controls below to adjust the font size, line spacing, and toggle dark mode for a better reading experience.</p>
    <p>Your reading progress will be saved automatically as you navigate through the book.</p>
  `;
};

// Function to determine book content based on ID, title, author
const getBookContent = async (id: string, title: string, author: string): Promise<BookContent> => {
  let content: string | null = null;
  
  // Try to get content from Gutendex API
  content = await fetchGutendexContent(title, author);
  
  // If that fails, try to generate content based on the book ID patterns
  if (!content) {
    if (id?.includes('OL')) {
      // OpenLibrary ID
      content = `
        <h1>${title}</h1>
        <h2>by ${author}</h2>
        <p class="chapter">CHAPTER I.</p>
        <p>It was a bright day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.</p>
        <p>The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.</p>
        <p>Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours. It was part of the economy drive in preparation for Hate Week. The flat was seven flights up, and Winston, who was thirty-nine and had a varicose ulcer above his right ankle, went slowly, resting several times on the way.</p>
      `;
    } else if (id?.includes('harry') || id?.includes('potter')) {
      // Harry Potter related
      content = `
        <h1>${title}</h1>
        <h2>by ${author}</h2>
        <p class="chapter">CHAPTER ONE - THE BOY WHO LIVED</p>
        <p>Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.</p>
        <p>Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.</p>
        <p>The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere.</p>
      `;
    } else {
      // Default or fallback content
      content = generateFallbackContent(title, author);
    }
  }
  
  return {
    title: title,
    content: content,
    author: author
  };
};

// Calculate an appropriate number of pages based on content
const calculateTotalPages = (content: string): number => {
  if (!content) return 100;
  
  // A simple calculation: roughly one page per 1000 characters
  const contentLength = content.length;
  const pagesEstimate = Math.max(20, Math.ceil(contentLength / 1000));
  
  // Round to nearest 5 for a cleaner number
  return Math.ceil(pagesEstimate / 5) * 5;
};

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
    content: '',
    author: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<ReadingProgress>({
    bookId: id || '',
    currentPage: 1,
    totalPages: 100,
    percentage: 0,
    lastRead: new Date().toISOString()
  });

  // Fetch book details to get title and author
  const { data: bookDetails } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookDetails(id as string),
    enabled: !!id
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

        // Get book details for content
        let title = 'Book';
        let author = 'Unknown Author';
        
        if (bookDetails) {
          title = bookDetails.title || 'Book';
          author = bookDetails.author || 'Unknown Author';
        }

        // Fetch appropriate content for this specific book
        const content = await getBookContent(id || '', title, author);
        setBookContent(content);
        
        // Update total pages based on content length
        const totalPages = calculateTotalPages(content.content);
        setProgress(prev => ({
          ...prev,
          totalPages: totalPages,
          // Maintain the same percentage but adjust the page number
          currentPage: Math.max(1, Math.min(Math.round((prev.percentage / 100) * totalPages), totalPages))
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
            dangerouslySetInnerHTML={{ __html: bookContent.content }}
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
