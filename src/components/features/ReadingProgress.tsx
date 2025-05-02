
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { storage } from "@/utils/localStorage";

interface ReadingProgressProps {
  bookId: string;
  bookTitle: string;
  totalPages?: number;
}

export function ReadingProgress({ bookId, bookTitle, totalPages = 100 }: ReadingProgressProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [progress, setProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [usePercentage, setUsePercentage] = useState<boolean>(totalPages === undefined);
  
  // Lade den gespeicherten Fortschritt beim ersten Rendern
  useEffect(() => {
    const savedProgress = storage.get<{
      progress: number;
      currentPage: number;
      usePercentage: boolean;
      lastUpdated: string;
    }>(`reading-progress-${bookId}`, {
      progress: 0,
      currentPage: 0,
      usePercentage: usePercentage,
      lastUpdated: new Date().toISOString(),
    });
    
    setProgress(savedProgress.progress);
    setCurrentPage(savedProgress.currentPage);
    setUsePercentage(savedProgress.usePercentage);
  }, [bookId, usePercentage]);
  
  // Speichere Fortschritt bei Änderungen
  const saveProgress = (newProgress: number, newPage: number, newUsePercentage: boolean) => {
    storage.set(`reading-progress-${bookId}`, {
      progress: newProgress,
      currentPage: newPage,
      usePercentage: newUsePercentage,
      lastUpdated: new Date().toISOString(),
    });
    
    toast({
      title: language === 'de' ? 'Fortschritt gespeichert' : 'Progress saved',
      description: language === 'de'
        ? `Dein Lesefortschritt für "${bookTitle}" wurde aktualisiert.`
        : `Your reading progress for "${bookTitle}" has been updated.`,
    });
  };
  
  // Aktualisiere Fortschritt mit Eingabe
  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value, 10) || 0;
    setCurrentPage(newPage);
    
    // Berechne Prozentsatz basierend auf Seiten
    if (!usePercentage) {
      const newProgress = Math.min(Math.round((newPage / totalPages) * 100), 100);
      setProgress(newProgress);
    }
  };
  
  // Aktualisiere Fortschritt mit Slider
  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    
    // Berechne Seite basierend auf Prozentsatz
    if (!usePercentage) {
      const newPage = Math.round((newProgress / 100) * totalPages);
      setCurrentPage(newPage);
    }
  };
  
  // Speichern-Button Handler
  const handleSave = () => {
    saveProgress(progress, currentPage, usePercentage);
  };
  
  // Umschalten zwischen Prozent und Seiten
  const handleToggleMode = (checked: boolean) => {
    setUsePercentage(checked);
    
    // Wenn wir zu Prozent wechseln, behalten wir den aktuellen Prozentsatz bei
    // Wenn wir zu Seiten wechseln, berechnen wir die aktuelle Seite basierend auf dem Prozentsatz
    if (!checked && totalPages) {
      const newPage = Math.round((progress / 100) * totalPages);
      setCurrentPage(newPage);
    }
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {language === 'de' ? 'Lesefortschritt' : 'Reading Progress'}
        </h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor="use-percentage">
            {language === 'de' ? 'Prozent anzeigen' : 'Show percentage'}
          </Label>
          <Switch 
            id="use-percentage" 
            checked={usePercentage}
            onCheckedChange={handleToggleMode}
          />
        </div>
      </div>
      
      <Progress value={progress} className="h-2 w-full" />
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0{usePercentage ? '%' : ' ' + (language === 'de' ? 'Seiten' : 'pages')}</span>
        <span>{progress}%</span>
        <span>{usePercentage ? '100%' : totalPages + ' ' + (language === 'de' ? 'Seiten' : 'pages')}</span>
      </div>
      
      <div className="space-y-2">
        {usePercentage ? (
          <div className="space-y-2">
            <Label htmlFor="progress-slider">
              {language === 'de' ? 'Fortschritt anpassen' : 'Adjust progress'}
            </Label>
            <Slider
              id="progress-slider"
              defaultValue={[progress]}
              max={100}
              step={1}
              value={[progress]}
              onValueChange={handleProgressChange}
              className="my-4"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="current-page">
              {language === 'de' ? 'Aktuelle Seite' : 'Current page'}
            </Label>
            <Input
              id="current-page"
              type="number"
              min={0}
              max={totalPages}
              value={currentPage}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      <Button onClick={handleSave} className="w-full">
        {language === 'de' ? 'Fortschritt speichern' : 'Save progress'}
      </Button>
    </div>
  );
}
