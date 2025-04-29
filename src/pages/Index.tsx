
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Calendar, Star, Smile, HelpCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const renderFeatureCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { 
          title: t('language') === 'de' ? 'Stimmungs-Empfehlungen' : 'Mood Matching',
          description: t('language') === 'de' ? 'Finde Bücher passend zu deiner Stimmung' : 'Find books matching your mood',
          icon: <Smile className="h-8 w-8 text-bookradar-primary" />,
          href: "/recommendations"
        },
        {
          title: t('language') === 'de' ? 'Buch-Quiz' : 'Book Quiz',
          description: t('language') === 'de' ? 'Teste dein Buchwissen' : 'Test your book knowledge',
          icon: <HelpCircle className="h-8 w-8 text-bookradar-primary" />,
          href: "/quiz"
        },
        {
          title: t('language') === 'de' ? 'Lesestatistiken' : 'Reading Statistics',
          description: t('language') === 'de' ? 'Verfolge deinen Lesefortschritt' : 'Track your reading progress',
          icon: <Star className="h-8 w-8 text-bookradar-primary" />,
          href: "/statistics"
        },
        {
          title: t('language') === 'de' ? 'Buch-Kalender' : 'Book Calendar',
          description: t('language') === 'de' ? 'Entdecke neue Bücher jeden Tag' : 'Discover new books every day',
          icon: <Calendar className="h-8 w-8 text-bookradar-primary" />,
          href: "/calendar"
        }
      ].map((feature, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-primary/10 p-3">
              {feature.icon}
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
            <Button 
              variant="outline" 
              className="mt-2 w-full" 
              onClick={() => navigate(feature.href)}
            >
              {t('explore')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-bold mb-6">BookRadar</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('language') === 'de' 
              ? 'Entdecke neue Bücher und verfolge deinen Lesefortschritt'
              : 'Discover new books and track your reading progress'}
          </p>
          
          {renderFeatureCards()}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
