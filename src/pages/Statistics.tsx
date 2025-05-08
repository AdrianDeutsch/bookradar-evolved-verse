
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, LineChart, PieChart } from 'recharts';

const Statistics = () => {
  const { t } = useLanguage();
  
  // Sample reading data - would come from API or local storage in a real app
  const readingData = [
    { month: 'Jan', books: 2, pages: 450 },
    { month: 'Feb', books: 3, pages: 720 },
    { month: 'Mar', books: 1, pages: 320 },
    { month: 'Apr', books: 4, pages: 980 },
    { month: 'May', books: 2, pages: 540 },
    { month: 'Jun', books: 3, pages: 670 },
    { month: 'Jul', books: 5, pages: 1120 },
    { month: 'Aug', books: 2, pages: 430 },
    { month: 'Sep', books: 3, pages: 790 },
    { month: 'Oct', books: 4, pages: 880 },
    { month: 'Nov', books: 3, pages: 610 },
    { month: 'Dec', books: 2, pages: 390 }
  ];
  
  const genreData = [
    { name: 'Fiction', value: 45 },
    { name: 'Non-Fiction', value: 25 },
    { name: 'Science Fiction', value: 15 },
    { name: 'Mystery', value: 10 },
    { name: 'Other', value: 5 }
  ];

  const authorData = [
    { name: 'Jane Austen', books: 3 },
    { name: 'George Orwell', books: 2 },
    { name: 'J.K. Rowling', books: 7 },
    { name: 'Stephen King', books: 4 },
    { name: 'F. Scott Fitzgerald', books: 2 }
  ];
  
  // Configure charts
  const chartConfig = {
    books: {
      label: t('language') === 'de' ? 'Bücher' : 'Books',
      theme: {
        light: '#8B5CF6', // Using a purple that matches the brand
        dark: '#A78BFA',
      },
    },
    pages: {
      label: t('language') === 'de' ? 'Seiten' : 'Pages',
      theme: {
        light: '#2563EB', // Blue for pages
        dark: '#3B82F6',
      },
    },
    fiction: {
      label: t('language') === 'de' ? 'Fiction' : 'Fiction',
      color: '#8B5CF6',
    },
    nonFiction: {
      label: t('language') === 'de' ? 'Sachbuch' : 'Non-Fiction',
      color: '#2563EB',
    },
    scifi: {
      label: t('language') === 'de' ? 'Science-Fiction' : 'Science Fiction',
      color: '#10B981',
    },
    mystery: {
      label: t('language') === 'de' ? 'Krimi' : 'Mystery',
      color: '#F59E0B',
    },
    other: {
      label: t('language') === 'de' ? 'Andere' : 'Other',
      color: '#6B7280',
    },
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('statistics')}</h1>
          <p className="text-muted-foreground">
            {t('language') === 'de'
              ? 'Verfolge deine Lesefortschritte und -gewohnheiten'
              : 'Track your reading progress and habits'}
          </p>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              {t('language') === 'de' ? 'Übersicht' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="genres">
              {t('language') === 'de' ? 'Genres' : 'Genres'}
            </TabsTrigger>
            <TabsTrigger value="authors">
              {t('language') === 'de' ? 'Autoren' : 'Authors'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('language') === 'de' ? 'Leseverlauf' : 'Reading History'}</CardTitle>
                <CardDescription>
                  {t('language') === 'de' 
                    ? 'Bücher und Seiten pro Monat' 
                    : 'Books and pages read per month'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer 
                  config={chartConfig} 
                  className="h-full"
                >
                  <LineChart 
                    data={readingData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent nameKey="month" />
                      } 
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('language') === 'de' ? 'Gelesene Bücher' : 'Books Completed'}</CardTitle>
                  <CardDescription>
                    {t('language') === 'de' 
                      ? 'Gesamt: 34 Bücher' 
                      : 'Total: 34 books'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ChartContainer 
                    config={chartConfig} 
                    className="h-full"
                  >
                    <BarChart 
                      data={readingData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent nameKey="month" />
                        } 
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('language') === 'de' ? 'Gelesene Seiten' : 'Pages Read'}</CardTitle>
                  <CardDescription>
                    {t('language') === 'de' 
                      ? 'Gesamt: 7.900 Seiten' 
                      : 'Total: 7,900 pages'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ChartContainer 
                    config={chartConfig} 
                    className="h-full"
                  >
                    <LineChart 
                      data={readingData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent nameKey="month" />
                        } 
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="genres" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('language') === 'de' ? 'Beliebteste Genres' : 'Top Genres'}</CardTitle>
                <CardDescription>
                  {t('language') === 'de' 
                    ? 'Aufteilung deiner gelesenen Bücher nach Genres' 
                    : 'Breakdown of your read books by genre'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer 
                  config={chartConfig} 
                  className="h-full"
                >
                  <PieChart 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent nameKey="name" />
                      } 
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="authors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('language') === 'de' ? 'Lieblingsautoren' : 'Favorite Authors'}</CardTitle>
                <CardDescription>
                  {t('language') === 'de' 
                    ? 'Autoren, deren Bücher du am häufigsten gelesen hast' 
                    : 'Authors whose books you have read the most'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer 
                  config={chartConfig} 
                  className="h-full"
                >
                  <BarChart 
                    data={authorData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent nameKey="name" />
                      } 
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Statistics;
