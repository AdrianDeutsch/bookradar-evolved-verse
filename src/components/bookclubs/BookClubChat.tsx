
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useBookClubs, BookClubMessage } from '@/hooks/useBookClubs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookClubChatProps {
  clubId: string;
  messages: BookClubMessage[];
  isMember: boolean;
}

const BookClubChat = ({ clubId, messages, isMember }: BookClubChatProps) => {
  const { language } = useLanguage();
  const { sendMessage, currentUser } = useBookClubs();
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sort messages by timestamp (newest last)
  const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId || !message.trim()) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      const success = sendMessage(clubId, message.trim());
      if (success) {
        setMessage('');
      } else {
        setError(language === 'de'
          ? 'Nachricht konnte nicht gesendet werden'
          : 'Message could not be sent');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(language === 'de'
        ? 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
        : 'An error occurred. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(
      language === 'de' ? 'de-DE' : 'en-US',
      { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      }
    );
  };

  if (!isMember) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          {language === 'de' ? 'Diskussion' : 'Discussion'}
        </CardTitle>
        <CardDescription>
          {language === 'de' 
            ? 'Diskutiere mit anderen Mitgliedern über Bücher und mehr'
            : 'Discuss with other members about books and more'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Message Area */}
        <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-md bg-muted/20" id="messages-container">
          {sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {language === 'de'
                  ? 'Noch keine Nachrichten. Starte die Konversation!'
                  : 'No messages yet. Start the conversation!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.userId === currentUser.id ? 'justify-end' : ''}`}>
                  {msg.userId !== currentUser.id && (
                    <Avatar>
                      <AvatarFallback>{msg.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] ${msg.userId === currentUser.id ? 'bg-primary/10 text-primary-foreground' : 'bg-muted'} p-3 rounded-lg`}>
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-medium">{msg.userId === currentUser.id ? 
                        (language === 'de' ? 'Du' : 'You') : 
                        msg.username}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{msg.content}</p>
                  </div>
                  {msg.userId === currentUser.id && (
                    <Avatar>
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2 mb-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={language === 'de' ? "Nachricht eingeben..." : "Type a message..."}
            className="flex-1"
            disabled={sendingMessage}
          />
          <Button type="submit" disabled={!message.trim() || sendingMessage}>
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">{language === 'de' ? 'Senden' : 'Send'}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookClubChat;
