import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, BookOpen, ChevronRight, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { storage } from '@/utils/localStorage';

interface Question {
  id: number;
  book: {
    title: string;
    author: string;
    coverUrl: string;
  };
  options: string[];
  correctAnswer: number;
}

const generateQuestions = (count: number = 5): Question[] => {
  // Ensure titles and authors match correctly
  const questions = [
    {
      id: 1,
      book: {
        title: "Der Alchimist",
        author: "Paulo Coelho",
        coverUrl: "https://covers.openlibrary.org/b/id/8587183-M.jpg",
      },
      options: ["Paulo Coelho", "Gabriel García Márquez", "Isabel Allende", "Jorge Luis Borges"],
      correctAnswer: 0, // Paulo Coelho is the correct author of "Der Alchimist"
    },
    {
      id: 2,
      book: {
        title: "Harry Potter und der Stein der Weisen",
        author: "J.K. Rowling",
        coverUrl: "https://covers.openlibrary.org/b/id/10523128-M.jpg",
      },
      options: ["J.K. Rowling", "Stephenie Meyer", "Rick Riordan", "C.S. Lewis"],
      correctAnswer: 0, // J.K. Rowling is the correct author
    },
    {
      id: 3,
      book: {
        title: "1984",
        author: "George Orwell",
        coverUrl: "https://covers.openlibrary.org/b/id/8575111-M.jpg",
      },
      options: ["Franz Kafka", "George Orwell", "Aldous Huxley", "Ray Bradbury"],
      correctAnswer: 1, // George Orwell is the correct author of "1984"
    },
    {
      id: 4,
      book: {
        title: "Die unendliche Geschichte",
        author: "Michael Ende",
        coverUrl: "https://covers.openlibrary.org/b/id/9317384-M.jpg",
      },
      options: ["Michael Ende", "Astrid Lindgren", "Cornelia Funke", "Otfried Preußler"],
      correctAnswer: 0, // Michael Ende is the correct author
    },
    {
      id: 5,
      book: {
        title: "Der kleine Prinz",
        author: "Antoine de Saint-Exupéry",
        coverUrl: "https://covers.openlibrary.org/b/id/7895100-M.jpg",
      },
      options: ["Charles Perrault", "Hans Christian Andersen", "Antoine de Saint-Exupéry", "Jules Verne"],
      correctAnswer: 2, // Antoine de Saint-Exupéry is the correct author
    },
    {
      id: 6,
      book: {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        coverUrl: "https://covers.openlibrary.org/b/id/12000553-M.jpg",
      },
      options: ["Ernest Hemingway", "Harper Lee", "John Steinbeck", "F. Scott Fitzgerald"],
      correctAnswer: 1, // Harper Lee is the correct author
    },
    {
      id: 7,
      book: {
        title: "Die Verwandlung",
        author: "Franz Kafka",
        coverUrl: "https://covers.openlibrary.org/b/id/12890279-M.jpg",
      },
      options: ["Thomas Mann", "Hermann Hesse", "Franz Kafka", "Stefan Zweig"],
      correctAnswer: 2, // Franz Kafka is the correct author
    },
    {
      id: 8,
      book: {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        coverUrl: "https://covers.openlibrary.org/b/id/12645114-M.jpg",
      },
      options: ["Jane Austen", "Charlotte Brontë", "Emily Brontë", "Virginia Woolf"],
      correctAnswer: 0, // Jane Austen is the correct author
    },
  ];
  
  // Shuffle and return requested count
  return [...questions].sort(() => 0.5 - Math.random()).slice(0, count);
};

const Quiz = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<{ name: string; score: number }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [playerName, setPlayerName] = useState("Player");

  useEffect(() => {
    // Load high scores from localStorage
    const savedHighScores = storage.get<{ name: string; score: number }[]>('bookradar-quiz-highscores', []);
    setHighScores(savedHighScores);
  }, []);

  const startQuiz = () => {
    setQuestions(generateQuestions(5));
    setCurrentQuestion(0);
    setScore(0);
    setStarted(true);
    setSelectedOption(null);
    setAnswered(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    
    setSelectedOption(optionIndex);
    setAnswered(true);
    
    const isCorrect = optionIndex === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      toast({
        title: t('language') === 'de' ? 'Richtig!' : 'Correct!',
        description: t('language') === 'de' ? '+10 Punkte' : '+10 points',
        variant: 'default',
      });
    } else {
      setScore(prev => Math.max(0, prev - 5));
      toast({
        title: t('language') === 'de' ? 'Falsch!' : 'Incorrect!',
        description: t('language') === 'de' ? '-5 Punkte' : '-5 points',
        variant: 'destructive',
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      // End of quiz
      const newHighScores = [...highScores, { name: playerName, score }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      setHighScores(newHighScores);
      storage.set('bookradar-quiz-highscores', newHighScores);
      
      toast({
        title: t('language') === 'de' ? 'Quiz beendet!' : 'Quiz completed!',
        description: `${t('language') === 'de' ? 'Dein Ergebnis' : 'Your score'}: ${score}`,
      });
      
      setStarted(false);
    }
  };

  if (!started) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-bookradar-primary" />
            {t('language') === 'de' ? 'Literatur-Quiz' : 'Literature Quiz'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('language') === 'de' 
              ? 'Teste dein Wissen über berühmte Bücher und Autoren.'
              : 'Test your knowledge about famous books and authors.'}
          </p>
          <div className="mt-6">
            <ol className="space-y-1 text-sm">
              {highScores.length > 0 ? (
                highScores.slice(0, 5).map((entry, i) => (
                  <li key={i} className="flex justify-between border-b pb-1">
                    <span>{entry.name}</span>
                    <span className="font-bold">{entry.score}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground italic">
                  {t('language') === 'de' ? 'Noch keine Highscores' : 'No high scores yet'}
                </li>
              )}
            </ol>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startQuiz} className="w-full">
            {t('language') === 'de' ? 'Quiz starten' : 'Start Quiz'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            {t('language') === 'de' ? 'Frage' : 'Question'} {currentQuestion + 1}/{questions.length}
          </CardTitle>
          <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-sm font-bold">
            {score} {t('language') === 'de' ? 'Punkte' : 'points'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <p className="mb-4 text-lg font-medium">
            {t('language') === 'de' ? 'Wer schrieb dieses Buch?' : 'Who wrote this book?'}
          </p>
          <div className="mb-4">
            <div className="relative w-36 h-48 mx-auto">
              {currentQ.book.coverUrl ? (
                <img 
                  src={currentQ.book.coverUrl} 
                  alt={currentQ.book.title}
                  className="w-full h-full object-cover shadow-md rounded-md"
                  onError={(e) => {
                    // Fallback for missing covers
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="mt-2 text-center font-medium">{currentQ.book.title}</p>
          </div>
        </div>

        <div className="grid gap-3 pt-3">
          {currentQ.options.map((option, i) => (
            <Button
              key={i}
              variant={
                answered
                  ? i === currentQ.correctAnswer
                    ? "default"
                    : i === selectedOption
                    ? "destructive"
                    : "outline"
                  : "outline"
              }
              className={`justify-start text-left ${
                answered && i === currentQ.correctAnswer ? "bg-green-500 hover:bg-green-600" : ""
              }`}
              onClick={() => handleAnswer(i)}
              disabled={answered}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>

      {answered && (
        <CardFooter>
          <Button onClick={nextQuestion} className="w-full">
            {currentQuestion < questions.length - 1
              ? t('language') === 'de'
                ? 'Nächste Frage'
                : 'Next Question'
              : t('language') === 'de'
                ? 'Ergebnis'
                : 'See Results'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default Quiz;
