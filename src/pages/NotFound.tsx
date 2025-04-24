
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { BookX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="flex justify-center mb-6">
          <BookX className="h-24 w-24 text-bookradar-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          {t('language') === 'de' 
            ? 'Hoppla! Diese Seite wurde nicht gefunden.'
            : 'Oops! Page not found.'}
        </p>
        <Button asChild>
          <Link to="/">
            {t('language') === 'de' 
              ? 'Zurück zur Startseite'
              : 'Return to Home'}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
