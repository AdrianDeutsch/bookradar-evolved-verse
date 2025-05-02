
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { storage } from "@/utils/localStorage";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2 } from 'lucide-react';

export interface Quote {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  content: string;
  page?: number;
  chapter?: string;
  tags: string[];
  date: string;
}

interface QuoteCollectionProps {
  bookId: string;
  bookTitle: string;
  author: string;
}

export function QuoteCollection({ bookId, bookTitle, author }: QuoteCollectionProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newQuote, setNewQuote] = useState("");
  const [page, setPage] = useState<string>("");
  const [chapter, setChapter] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  
  // Lade bestehende Zitate
  useEffect(() => {
    const savedQuotes = storage.get<Quote[]>('bookradar_quotes', [])
      .filter(quote => quote.bookId === bookId);
    setQuotes(savedQuotes);
  }, [bookId]);
  
  // Speichere ein neues Zitat
  const handleSaveQuote = () => {
    if (!newQuote.trim()) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de' 
          ? 'Bitte gib ein Zitat ein.' 
          : 'Please enter a quote.',
        variant: "destructive",
      });
      return;
    }
    
    const quote: Quote = {
      id: Date.now().toString(),
      bookId,
      bookTitle,
      author,
      content: newQuote,
      page: page ? parseInt(page, 10) : undefined,
      chapter: chapter || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      date: new Date().toISOString()
    };
    
    const updatedQuotes = storage.get<Quote[]>('bookradar_quotes', []);
    updatedQuotes.push(quote);
    storage.set('bookradar_quotes', updatedQuotes);
    
    setQuotes(prev => [...prev, quote]);
    setNewQuote("");
    setPage("");
    setChapter("");
    setTags("");
    
    toast({
      title: language === 'de' ? 'Zitat gespeichert' : 'Quote saved',
      description: language === 'de'
        ? `Dein Zitat aus "${bookTitle}" wurde gespeichert.`
        : `Your quote from "${bookTitle}" has been saved.`,
    });
  };
  
  // Lösche ein Zitat
  const handleDeleteQuote = (id: string) => {
    const updatedQuotes = storage.get<Quote[]>('bookradar_quotes', [])
      .filter(quote => quote.id !== id);
    storage.set('bookradar_quotes', updatedQuotes);
    
    setQuotes(prev => prev.filter(quote => quote.id !== id));
    
    toast({
      title: language === 'de' ? 'Zitat gelöscht' : 'Quote deleted',
      description: language === 'de' ? 'Das Zitat wurde gelöscht.' : 'The quote has been deleted.',
    });
  };
  
  // Teile ein Zitat (simuliert)
  const handleShareQuote = (quote: Quote) => {
    // Hier könnte später eine echte Sharing-Funktion implementiert werden
    const text = `"${quote.content}" - ${quote.author}, ${quote.bookTitle}`;
    
    if (navigator.share) {
      navigator.share({
        title: quote.bookTitle,
        text: text,
      }).catch(error => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: language === 'de' ? 'Zitat kopiert' : 'Quote copied',
          description: language === 'de' 
            ? 'Das Zitat wurde in die Zwischenablage kopiert.' 
            : 'The quote has been copied to clipboard.',
        });
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold text-lg">
          {language === 'de' ? 'Neues Zitat speichern' : 'Save New Quote'}
        </h3>
        
        <div className="space-y-3">
          <Textarea 
            placeholder={language === 'de' 
              ? 'Dein Lieblingszitat aus dem Buch...' 
              : 'Your favorite quote from the book...'
            }
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder={language === 'de' ? 'Seite (optional)' : 'Page (optional)'}
                type="number"
                value={page}
                onChange={(e) => setPage(e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder={language === 'de' ? 'Kapitel (optional)' : 'Chapter (optional)'}
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
          </div>
          
          <Input
            placeholder={language === 'de' 
              ? 'Tags (durch Komma getrennt)' 
              : 'Tags (comma separated)'
            }
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          
          <Button onClick={handleSaveQuote} className="w-full">
            {language === 'de' ? 'Zitat speichern' : 'Save Quote'}
          </Button>
        </div>
      </div>
      
      {quotes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {language === 'de' 
              ? `Gespeicherte Zitate (${quotes.length})` 
              : `Saved Quotes (${quotes.length})`
            }
          </h3>
          
          <div className="space-y-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      {quote.chapter ? `${quote.chapter}` : ''}
                      {quote.chapter && quote.page ? ' - ' : ''}
                      {quote.page ? `${language === 'de' ? 'Seite' : 'Page'} ${quote.page}` : ''}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareQuote(quote)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-2 pl-4 italic">
                    "{quote.content}"
                  </blockquote>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex flex-wrap gap-1">
                    {quote.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteQuote(quote.id)}
                  >
                    {language === 'de' ? 'Löschen' : 'Delete'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
