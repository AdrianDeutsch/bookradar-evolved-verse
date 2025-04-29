
import { useEffect } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Add event listener for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Implement keyboard shortcuts here (for accessibility)
      // Example: Alt+S for search, etc.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar is defined separately with its own toggle button */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
