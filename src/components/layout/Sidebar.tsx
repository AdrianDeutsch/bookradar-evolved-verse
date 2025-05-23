
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  Search, 
  BookOpen, 
  Star, 
  BarChart2, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Globe,
  UsersRound
} from 'lucide-react';

const Sidebar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const regularNavItems = [
    { name: t('home'), path: '/', icon: <Book className="h-5 w-5" /> },
    { name: t('search'), path: '/search', icon: <Search className="h-5 w-5" /> },
    { name: t('library'), path: '/library', icon: <BookOpen className="h-5 w-5" /> },
    { name: t('recommendations'), path: '/recommendations', icon: <Star className="h-5 w-5" /> },
    { name: t('statistics'), path: '/statistics', icon: <BarChart2 className="h-5 w-5" /> },
    { name: t('settings'), path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  // Check if nav is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed top-4 right-4 z-50 lg:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside 
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 bg-sidebar border-r border-sidebar-border shadow-lg`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-center space-x-2">
              <Book className="h-7 w-7 text-bookradar-primary" />
              <h1 className="text-xl font-bold text-sidebar-foreground">BookRadar</h1>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {regularNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors ${
                  isActive(item.path) ? 'bg-sidebar-accent font-medium' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Hervorgehobener Lesegruppen-Button */}
            <Link
              to="/bookclubs"
              className={`mt-4 flex items-center justify-center py-3 px-3 rounded-lg transition-all transform hover:scale-105 
                ${isActive('/bookclubs') 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' 
                  : 'bg-purple-500/80 text-white hover:bg-purple-600'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <UsersRound className="h-5 w-5 mr-2" />
              <span className="font-medium">{language === 'de' ? 'Lesegruppen' : 'Book Clubs'}</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleTheme}
                aria-label={theme === 'light' ? t('darkMode') : t('lightMode')}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleLanguage}
                aria-label={t('changeLanguage')}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
