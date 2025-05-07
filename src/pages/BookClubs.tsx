
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookClubsList from '@/components/bookclubs/BookClubsList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const BookClubs = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'de' ? 'Lesegruppen' : 'Book Clubs'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'de' 
                ? 'Entdecke und tritt Lesegruppen bei, um mit anderen Lesern zu diskutieren'
                : 'Discover and join book clubs to discuss with other readers'}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/bookclubs/new')} 
            className="sm:self-start flex items-center gap-2"
          >
            <Plus size={18} />
            {language === 'de' ? 'Lesegruppe erstellen' : 'Create Book Club'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {language === 'de' ? 'Alle Gruppen' : 'All Clubs'}
            </TabsTrigger>
            <TabsTrigger value="joined">
              {language === 'de' ? 'Meine Gruppen' : 'My Clubs'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="pt-4">
            <BookClubsList variant="all" />
          </TabsContent>

          <TabsContent value="joined" className="pt-4">
            <BookClubsList variant="joined" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BookClubs;
