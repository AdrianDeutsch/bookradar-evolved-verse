
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookClubsList from '@/components/bookclubs/BookClubsList';

const BookClubs = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Layout>
      <div className="space-y-6">
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
