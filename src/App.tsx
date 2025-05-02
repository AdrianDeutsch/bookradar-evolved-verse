
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Recommendations from "./pages/Recommendations";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BookDetails from "./pages/BookDetails";
import ReadingMode from "./components/features/ReadingMode";
import BookClubs from "./pages/BookClubs";
import CreateBookClub from "./pages/CreateBookClub";
import BookClubDetail from "./pages/BookClubDetail";
import JoinBookClub from "./pages/JoinBookClub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/book/:id/read" element={<ReadingMode />} />
              <Route path="/bookclubs" element={<BookClubs />} />
              <Route path="/bookclubs/new" element={<CreateBookClub />} />
              <Route path="/bookclubs/:id" element={<BookClubDetail />} />
              <Route path="/bookclubs/join/:id" element={<JoinBookClub />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
