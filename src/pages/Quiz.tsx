
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/utils/localStorage';
import { searchBooks, SearchResult } from '@/services/bookService';
import { Book, Award, RefreshCcw, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface QuizQuestion {
  coverUrl: string;
  correctTitle: string;
  correctAuthor: string;
  options: Array<{
    id: string;
    title: string;
    author: string;
  }>
}

const Quiz = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lastQuizDate, setLastQuizDate] = useState<string | null>(null);
  
  const totalQuestions = 5;

  useEffect(() => {
    loadHighScores();
    checkLastQuizDate();
    generateQuiz();
  }, []);

  const checkLastQuizDate = () => {
    const storedDate = storage.get<string>('bookradar-last-quiz-date', '');
    setLastQuizDate(storedDate);
    
    const today = new Date().toDateString();
    if (storedDate === today) {
      // User has already completed a quiz today
      toast({
        title: t('language') === 'de' ? 'Tägliches Quiz' : 'Daily Quiz',
        description: t('language') === 'de' 
          ? 'Du hast dein tägliches Quiz bereits absolviert! Neues Quiz morgen verfügbar.'
          : 'You have already completed your daily quiz! New quiz available tomorrow.',
      });
    }
  };

  const loadHighScores = () => {
    const scores = storage.get<number[]>('bookradar-quiz-highscores', []);
    setHighScores(scores.sort((a, b) => b - a).slice(0, 10));
  };

  const saveScore = (newScore: number) => {
    const scores = storage.get<number[]>('bookradar-quiz-highscores', []);
    const updatedScores = [...scores, newScore].sort((a, b) => b - a).slice(0, 10);
    storage.set('bookradar-quiz-highscores', updatedScores);
    setHighScores(updatedScores);
    
    // Mark today's quiz as completed
    storage.set('bookradar-last-quiz-date', new Date().toDateString());
    setLastQuizDate(new Date().toDateString());
  };

  const generateQuiz = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResults(false);
    setQuizCompleted(false);
    
    try {
      const quizQuestions: QuizQuestion[] = [];
      
      // List of different genres to search for variety
      const genres = ['fiction', 'fantasy', 'mystery', 'romance', 'classics', 'science fiction'];
      
      // Generate 5 questions
      for (let i = 0; i < totalQuestions; i++) {
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        const searchResults = await searchBooks({ query: randomGenre, limit: 20 });
        
        // Ensure we have at least 4 results to create a question
        if (searchResults.length < 4) {
          continue;
        }
        
        // Use a random book as the correct answer
        const correctIndex = Math.floor(Math.random() * searchResults.length);
        const correctBook = searchResults[correctIndex];
        
        // Generate 3 wrong options
        const wrongOptions = [];
        const usedIndices = new Set([correctIndex]);
        
        while (wrongOptions.length < 3) {
          const randomIndex = Math.floor(Math.random() * searchResults.length);
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            wrongOptions.push(searchResults[randomIndex]);
          }
        }
        
        // Combine correct and wrong options
        const allOptions = [
          correctBook,
          ...wrongOptions
        ];
        
        // Shuffle options
        for (let j = allOptions.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [allOptions[j], allOptions[k]] = [allOptions[k], allOptions[j]];
        }
        
        quizQuestions.push({
          coverUrl: correctBook.coverUrl || '',
          correctTitle: correctBook.title,
          correctAuthor: correctBook.author,
          options: allOptions.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author
          }))
        });
      }
      
      setQuestions(quizQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: t('error'),
        description: t('language') === 'de' 
          ? 'Fehler beim Laden des Quiz. Bitte versuche es später erneut.'
          : 'Error loading quiz. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionTitle: string) => {
    setSelectedOption(optionTitle);
  };

  const handleNextQuestion = () => {
    // Check if answer is correct
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctTitle;
    
    // Update score
    if (isCorrect) {
      setScore(score + 10);
      toast({
        title: t('correct'),
        description: `+10 ${t('points')}!`,
        variant: 'default',
      });
    } else {
      setScore(Math.max(0, score - 5));
      toast({
        title: t('incorrect'),
        description: `-5 ${t('points')}. ${t('correctAnswer')}: ${currentQuestion.correctTitle}`,
        variant: 'destructive',
      });
    }
    
    // Move to next question or end quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
      saveScore(score + (isCorrect ? 10 : -5));
    }
  };

  const renderQuiz = () => {
    if (loading || questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin">
            <RefreshCcw className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {t('language') === 'de' ? 'Quiz wird geladen...' : 'Loading quiz...'}
          </p>
        </div>
      );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) {
      return (
        <div className="text-center py-8">
          <p>{t('language') === 'de' ? 'Keine Quizfragen gefunden.' : 'No quiz questions found.'}</p>
          <Button onClick={generateQuiz} className="mt-4">
            {t('language') === 'de' ? 'Neues Quiz generieren' : 'Generate New Quiz'}
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Badge className="mb-2">
              {t('question')} {currentQuestionIndex + 1}/{questions.length}
            </Badge>
            <h2 className="text-xl font-semibold">
              {t('language') === 'de' ? 'Welches Buch ist das?' : 'Which book is this?'}
            </h2>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-lg font-bold">
              {score} {t('points')}
            </Badge>
          </div>
        </div>
        
        <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex justify-center">
            {currentQuestion.coverUrl ? (
              <img 
                src={currentQuestion.coverUrl} 
                alt="Mystery book cover" 
                className="h-64 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/240x360/e2e8f0/64748b?text=Mystery+Book';
                }}
              />
            ) : (
              <div className="h-64 w-48 bg-muted flex items-center justify-center rounded-lg">
                <Book className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.title)}
                  variant={selectedOption === option.title ? "default" : "outline"}
                  className={`w-full justify-start h-auto py-3 px-4 text-left ${
                    selectedOption === option.title ? "border-primary" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{option.title}</p>
                    <p className="text-sm text-muted-foreground">{option.author}</p>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleNextQuestion} 
                disabled={!selectedOption}
                size="lg"
              >
                {currentQuestionIndex < questions.length - 1 
                  ? t('language') === 'de' ? 'Nächste Frage' : 'Next Question'
                  : t('language') === 'de' ? 'Ergebnis anzeigen' : 'Show Results'
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="text-center py-8 space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-6">
          <Trophy className="h-16 w-16 text-bookradar-primary" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t('language') === 'de' ? 'Quiz abgeschlossen!' : 'Quiz Completed!'}
        </h2>
        <p className="text-muted-foreground">
          {t('language') === 'de' 
            ? `Dein Ergebnis: ${score} Punkte` 
            : `Your score: ${score} points`}
        </p>
      </div>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t('language') === 'de' ? 'Bestenliste' : 'Top Scores'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {highScores.length > 0 ? (
              highScores.map((highScore, index) => (
                <li key={index} className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? "default" : "outline"} className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <span>{highScore} {t('points')}</span>
                  </div>
                  {highScore === score && quizCompleted && (
                    <Badge variant="secondary">
                      {t('language') === 'de' ? 'Neu' : 'New'}
                    </Badge>
                  )}
                </li>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                {t('language') === 'de' ? 'Keine Ergebnisse bisher.' : 'No scores yet.'}
              </p>
            )}
          </ol>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={generateQuiz} 
            disabled={lastQuizDate === new Date().toDateString()}
          >
            {t('language') === 'de' ? 'Neues Quiz starten' : 'Start New Quiz'}
          </Button>
        </CardFooter>
      </Card>
      
      {lastQuizDate === new Date().toDateString() && (
        <p className="text-sm text-muted-foreground mt-4">
          {t('language') === 'de'
            ? 'Du hast dein tägliches Quiz bereits absolviert. Komm morgen wieder für ein neues Quiz!'
            : 'You have completed your daily quiz. Come back tomorrow for a new quiz!'}
        </p>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Award className="h-6 w-6" />
            {t('language') === 'de' ? 'Buch-Quiz' : 'Book Quiz'}
          </h1>
          <p className="text-muted-foreground">
            {t('language') === 'de'
              ? 'Teste dein Wissen über Bücher und erhalte Punkte für richtige Antworten.'
              : 'Test your knowledge of books and earn points for correct answers.'}
          </p>
        </div>
        
        {showResults ? renderResults() : renderQuiz()}
      </div>
    </Layout>
  );
};

export default Quiz;
