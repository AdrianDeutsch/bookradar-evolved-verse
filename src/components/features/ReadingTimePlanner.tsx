
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { storage } from "@/utils/localStorage";
import { addDays, format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface ReadingTimePlannerProps {
  bookId: string;
  bookTitle: string;
  totalPages?: number;
}

interface ReadingPlan {
  bookId: string;
  pagesPerDay: number;
  startDate: string;
  estimatedFinishDate: string;
  totalPages: number;
}

export function ReadingTimePlanner({ bookId, bookTitle, totalPages = 300 }: ReadingTimePlannerProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [pagesPerDay, setPagesPerDay] = useState<number>(10);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [estimatedDays, setEstimatedDays] = useState<number>(0);
  const [estimatedFinishDate, setEstimatedFinishDate] = useState<Date | null>(null);
  const [savedPlan, setSavedPlan] = useState<ReadingPlan | null>(null);
  
  // Lade gespeicherten Plan
  useEffect(() => {
    const plan = storage.get<ReadingPlan | null>(`reading-plan-${bookId}`, null);
    if (plan) {
      setSavedPlan(plan);
      setPagesPerDay(plan.pagesPerDay);
      setStartDate(new Date(plan.startDate));
      setEstimatedFinishDate(new Date(plan.estimatedFinishDate));
    }
  }, [bookId]);
  
  // Berechne den geschätzten Fertigstellungstermin
  useEffect(() => {
    if (pagesPerDay <= 0) {
      setEstimatedDays(0);
      setEstimatedFinishDate(null);
      return;
    }
    
    const days = Math.ceil(totalPages / pagesPerDay);
    setEstimatedDays(days);
    
    const finishDate = addDays(startDate, days);
    setEstimatedFinishDate(finishDate);
  }, [pagesPerDay, totalPages, startDate]);
  
  // Speichere den Leseplan
  const handleSavePlan = () => {
    if (!estimatedFinishDate) return;
    
    const plan: ReadingPlan = {
      bookId,
      pagesPerDay,
      startDate: startDate.toISOString(),
      estimatedFinishDate: estimatedFinishDate.toISOString(),
      totalPages,
    };
    
    storage.set(`reading-plan-${bookId}`, plan);
    setSavedPlan(plan);
    
    toast({
      title: language === 'de' ? 'Leseplan gespeichert' : 'Reading plan saved',
      description: language === 'de'
        ? `Dein Leseplan für "${bookTitle}" wurde gespeichert.`
        : `Your reading plan for "${bookTitle}" has been saved.`,
    });
  };
  
  // Formatiere das Datum basierend auf der Sprache
  const formatDate = (date: Date): string => {
    return format(date, 'PP', { locale: language === 'de' ? de : undefined });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'de' ? 'Leseplan erstellen' : 'Create Reading Plan'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages-per-day">
              {language === 'de' ? 'Seiten pro Tag' : 'Pages per day'}
            </Label>
            <Input
              id="pages-per-day"
              type="number"
              min={1}
              value={pagesPerDay}
              onChange={(e) => setPagesPerDay(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>
              {language === 'de' ? 'Startdatum' : 'Start date'}
            </Label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              className="border rounded-md"
            />
          </div>
          
          {estimatedFinishDate && (
            <div className="pt-4 space-y-2">
              <div className="text-center text-lg font-medium">
                {language === 'de' ? 'Geschätzte Fertigstellung' : 'Estimated completion'}
              </div>
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="text-2xl font-bold">
                  {formatDate(estimatedFinishDate)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'de' 
                    ? `(in ${estimatedDays} Tagen bei ${pagesPerDay} Seiten täglich)`
                    : `(in ${estimatedDays} days at ${pagesPerDay} pages daily)`
                  }
                </div>
              </div>
            </div>
          )}
          
          <Button onClick={handleSavePlan} className="w-full mt-4">
            {language === 'de' ? 'Leseplan speichern' : 'Save Reading Plan'}
          </Button>
        </CardContent>
      </Card>
      
      {savedPlan && (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'de' ? 'Aktueller Leseplan' : 'Current Reading Plan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>
                <strong>{language === 'de' ? 'Start:' : 'Start:'}</strong> {formatDate(new Date(savedPlan.startDate))}
              </div>
              <div>
                <strong>{language === 'de' ? 'Ziel:' : 'Target:'}</strong> {formatDate(new Date(savedPlan.estimatedFinishDate))}
              </div>
              <div>
                <strong>{language === 'de' ? 'Tempo:' : 'Pace:'}</strong> {savedPlan.pagesPerDay} {language === 'de' ? 'Seiten pro Tag' : 'pages per day'}
              </div>
              
              {estimatedFinishDate && (
                <div className="pt-2 text-xs">
                  {differenceInDays(new Date(savedPlan.estimatedFinishDate), new Date()) > 0 
                    ? (language === 'de' 
                        ? `Noch ${differenceInDays(new Date(savedPlan.estimatedFinishDate), new Date())} Tage bis zum Ziel` 
                        : `${differenceInDays(new Date(savedPlan.estimatedFinishDate), new Date())} days left to reach the goal`)
                    : (language === 'de'
                        ? 'Dein Leseziel wurde erreicht!'
                        : 'Your reading goal has been reached!')
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
