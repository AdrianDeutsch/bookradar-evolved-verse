
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Globe, Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  // Sample user settings - in a real app, these would be stored in a database or local storage
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: false,
    saveReadingProgress: true,
    saveOffline: true,
    autoDetectLanguage: false,
    fontSize: 16,
    lineHeight: 1.5
  });

  const handleSettingsChange = (key: string, value: boolean | number) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('settings')}</h1>
          <p className="text-muted-foreground">
            {t('language') === 'de'
              ? 'Passe die App deinen Bedürfnissen an'
              : 'Customize the app to your preferences'}
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('language') === 'de' ? 'Darstellung' : 'Display'}</CardTitle>
              <CardDescription>
                {t('language') === 'de' 
                  ? 'Passe das Aussehen der App an' 
                  : 'Customize the appearance of the app'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('language') === 'de' ? 'Erscheinungsbild' : 'Theme'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' 
                      ? (t('language') === 'de' ? 'Dunkler Modus aktiviert' : 'Dark mode enabled')
                      : (t('language') === 'de' ? 'Heller Modus aktiviert' : 'Light mode enabled')}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('language') === 'de' ? 'Sprache' : 'Language'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' ? 'Deutsch' : 'English'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label htmlFor="fontSize">
                  {t('language') === 'de' ? 'Schriftgröße' : 'Font Size'}: {settings.fontSize}px
                </Label>
                <Input
                  id="fontSize"
                  type="range"
                  min="12"
                  max="24"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => handleSettingsChange('fontSize', parseInt(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="lineHeight">
                  {t('language') === 'de' ? 'Zeilenhöhe' : 'Line Height'}: {settings.lineHeight}
                </Label>
                <Input
                  id="lineHeight"
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => handleSettingsChange('lineHeight', parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('language') === 'de' ? 'Benachrichtigungen' : 'Notifications'}</CardTitle>
              <CardDescription>
                {t('language') === 'de' 
                  ? 'Verwalte deine Benachrichtigungseinstellungen' 
                  : 'Manage your notification preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">
                    {t('language') === 'de' ? 'Benachrichtigungen aktivieren' : 'Enable Notifications'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Erhalte Updates zu deinen Büchern und Lesezielen' 
                      : 'Receive updates about your books and reading goals'}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => handleSettingsChange('notificationsEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">
                    {t('language') === 'de' ? 'E-Mail-Benachrichtigungen' : 'Email Notifications'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Erhalte wichtige Updates per E-Mail' 
                      : 'Receive important updates via email'}
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                  disabled={!settings.notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('language') === 'de' ? 'Datenspeicherung' : 'Data Storage'}</CardTitle>
              <CardDescription>
                {t('language') === 'de' 
                  ? 'Verwalte, wie deine Daten gespeichert werden' 
                  : 'Manage how your data is stored'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="saveProgress">
                    {t('language') === 'de' ? 'Lesefortschritt speichern' : 'Save Reading Progress'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Speichert deinen Fortschritt in Büchern' 
                      : 'Saves your progress in books'}
                  </p>
                </div>
                <Switch
                  id="saveProgress"
                  checked={settings.saveReadingProgress}
                  onCheckedChange={(checked) => handleSettingsChange('saveReadingProgress', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="saveOffline">
                    {t('language') === 'de' ? 'Offline speichern' : 'Save Offline'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Speichert Buchinhalte für Offline-Nutzung' 
                      : 'Saves book content for offline use'}
                  </p>
                </div>
                <Switch
                  id="saveOffline"
                  checked={settings.saveOffline}
                  onCheckedChange={(checked) => handleSettingsChange('saveOffline', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoDetectLanguage">
                    {t('language') === 'de' ? 'Sprache automatisch erkennen' : 'Auto-detect Language'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('language') === 'de' 
                      ? 'Erkennt die Sprache des Buches automatisch' 
                      : 'Automatically detects the language of the book'}
                  </p>
                </div>
                <Switch
                  id="autoDetectLanguage"
                  checked={settings.autoDetectLanguage}
                  onCheckedChange={(checked) => handleSettingsChange('autoDetectLanguage', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                {t('language') === 'de' ? 'Einstellungen speichern' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
