
import { useState, useEffect } from 'react';
import { storage } from '@/utils/localStorage';
import { LibraryBook } from '@/hooks/useLocalLibrary';

// Definiere Typen für Lesegruppen und Nachrichten
export interface BookClubMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface BookClub {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  members: string[]; // User-IDs
  currentBookId: string | null;
  books: string[]; // Book-IDs für die Club-History
  messages: BookClubMessage[];
  imageUrl?: string;
}

// User-Repräsentation (vereinfacht für lokale Nutzung)
export interface LocalUser {
  id: string;
  name: string;
  joinedClubs: string[]; // Club-IDs
}

const CURRENT_USER_KEY = 'bookradar_current_user';
const BOOK_CLUBS_KEY = 'bookradar_book_clubs';

export function useBookClubs() {
  const [bookClubs, setBookClubs] = useState<BookClub[]>(() => 
    storage.get<BookClub[]>(BOOK_CLUBS_KEY, [])
  );
  
  const [currentUser, setCurrentUser] = useState<LocalUser>(() => {
    const savedUser = storage.get<LocalUser>(CURRENT_USER_KEY, null);
    if (savedUser) return savedUser;
    
    // Erstelle einen Beispielnutzer, wenn keiner existiert
    const newUser = {
      id: 'user_' + Date.now(),
      name: 'Leser ' + Math.floor(Math.random() * 1000),
      joinedClubs: []
    };
    storage.set(CURRENT_USER_KEY, newUser);
    return newUser;
  });

  // Speichere Änderungen im localStorage
  useEffect(() => {
    storage.set(BOOK_CLUBS_KEY, bookClubs);
  }, [bookClubs]);
  
  useEffect(() => {
    storage.set(CURRENT_USER_KEY, currentUser);
  }, [currentUser]);

  // Create a new book club
  const createBookClub = (name: string, description: string, imageUrl?: string) => {
    const newClub: BookClub = {
      id: 'club_' + Date.now(),
      name,
      description,
      createdAt: Date.now(),
      members: [currentUser.id], // Creator is the first member
      currentBookId: null,
      books: [],
      messages: [],
      imageUrl
    };
    
    // Update bookClubs state
    setBookClubs(prevClubs => [...prevClubs, newClub]);
    
    // Add club to user's joined clubs
    setCurrentUser(prevUser => ({
      ...prevUser,
      joinedClubs: [...prevUser.joinedClubs, newClub.id]
    }));
    
    return newClub;
  };

  // Join an existing book club
  const joinBookClub = (clubId: string) => {
    const clubExists = bookClubs.some(club => club.id === clubId);
    const alreadyJoined = currentUser.joinedClubs.includes(clubId);
    
    if (!clubExists || alreadyJoined) return false;
    
    // Add user to club members
    setBookClubs(prevClubs => 
      prevClubs.map(club => 
        club.id === clubId
          ? { ...club, members: [...club.members, currentUser.id] }
          : club
      )
    );
    
    // Add club to user's joined clubs
    setCurrentUser(prevUser => ({
      ...prevUser,
      joinedClubs: [...prevUser.joinedClubs, clubId]
    }));
    
    return true;
  };

  // Leave a book club
  const leaveBookClub = (clubId: string) => {
    const clubExists = bookClubs.some(club => club.id === clubId);
    const isJoined = currentUser.joinedClubs.includes(clubId);
    
    if (!clubExists || !isJoined) return false;
    
    // Remove user from club members
    setBookClubs(prevClubs => 
      prevClubs.map(club => 
        club.id === clubId
          ? { ...club, members: club.members.filter(id => id !== currentUser.id) }
          : club
      )
    );
    
    // Remove club from user's joined clubs
    setCurrentUser(prevUser => ({
      ...prevUser,
      joinedClubs: prevUser.joinedClubs.filter(id => id !== clubId)
    }));
    
    return true;
  };

  // Aktualisiere Buch für eine Lesegruppe
  const updateCurrentBook = (clubId: string, bookId: string) => {
    setBookClubs(prevClubs => 
      prevClubs.map(club => {
        if (club.id !== clubId) return club;
        
        // Füge das alte aktuelle Buch zur Verlaufsliste hinzu, falls vorhanden
        const updatedBooks = club.currentBookId && !club.books.includes(club.currentBookId)
          ? [...club.books, club.currentBookId]
          : club.books;
          
        return {
          ...club,
          currentBookId: bookId,
          books: updatedBooks.includes(bookId) 
            ? updatedBooks 
            : [...updatedBooks, bookId]
        };
      })
    );
  };

  // Sende eine neue Nachricht
  const sendMessage = (clubId: string, content: string) => {
    if (!content.trim()) return false;
    
    const newMessage: BookClubMessage = {
      id: 'msg_' + Date.now(),
      userId: currentUser.id,
      username: currentUser.name,
      content,
      timestamp: Date.now()
    };
    
    setBookClubs(prevClubs => 
      prevClubs.map(club => 
        club.id === clubId
          ? { ...club, messages: [...club.messages, newMessage] }
          : club
      )
    );
    
    return true;
  };

  // Aktualisiere Nutzernamen
  const updateUserName = (newName: string) => {
    if (!newName.trim()) return false;
    
    setCurrentUser(prevUser => ({
      ...prevUser,
      name: newName
    }));
    
    return true;
  };

  // Finde ein bestimmtes BookClub
  const getBookClub = (clubId: string) => {
    return bookClubs.find(club => club.id === clubId) || null;
  };

  // Prüfe, ob der Nutzer einem Club beigetreten ist
  const isClubMember = (clubId: string) => {
    return currentUser.joinedClubs.includes(clubId);
  };

  // Filtert BookClubs basierend auf einem Suchbegriff
  const searchBookClubs = (query: string) => {
    if (!query.trim()) return bookClubs;
    
    const normalizedQuery = query.toLowerCase();
    return bookClubs.filter(club => 
      club.name.toLowerCase().includes(normalizedQuery) ||
      club.description.toLowerCase().includes(normalizedQuery)
    );
  };

  return {
    bookClubs,
    currentUser,
    userClubs: bookClubs.filter(club => currentUser.joinedClubs.includes(club.id)),
    createBookClub,
    joinBookClub,
    leaveBookClub,
    updateCurrentBook,
    sendMessage,
    updateUserName,
    getBookClub,
    isClubMember,
    searchBookClubs
  };
}
