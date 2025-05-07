
import { useState, useEffect } from 'react';
import { storage } from '@/utils/localStorage';
import { LibraryBook } from '@/hooks/useLocalLibrary';

// Define types for book clubs and messages
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
  books: string[]; // Book-IDs for the club history
  messages: BookClubMessage[];
  imageUrl?: string;
}

// User representation (simplified for local use)
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
    
    // Create a sample user if none exists
    const newUser = {
      id: 'user_' + Date.now(),
      name: 'Reader ' + Math.floor(Math.random() * 1000),
      joinedClubs: []
    };
    storage.set(CURRENT_USER_KEY, newUser);
    return newUser;
  });

  // Save changes to localStorage
  useEffect(() => {
    storage.set(BOOK_CLUBS_KEY, bookClubs);
  }, [bookClubs]);
  
  useEffect(() => {
    storage.set(CURRENT_USER_KEY, currentUser);
  }, [currentUser]);

  // Create a new book club
  const createBookClub = (name: string, description: string, imageUrl?: string): BookClub => {
    if (!name.trim()) {
      throw new Error('Book club name is required');
    }
    
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
  const joinBookClub = (clubId: string): boolean => {
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
  const leaveBookClub = (clubId: string): boolean => {
    const clubExists = bookClubs.some(club => club.id === clubId);
    const isJoined = currentUser.joinedClubs.includes(clubId);
    
    if (!clubExists || !isJoined) return false;
    
    // Check if user is the last member or creator (first member)
    const club = bookClubs.find(c => c.id === clubId);
    if (!club) return false;
    
    if (club.members.length === 1) {
      // Last member - delete the club
      setBookClubs(prevClubs => prevClubs.filter(c => c.id !== clubId));
    } else if (club.members[0] === currentUser.id) {
      // Creator is leaving - make the next member the creator
      setBookClubs(prevClubs => 
        prevClubs.map(c => {
          if (c.id !== clubId) return c;
          
          const remainingMembers = c.members.filter(id => id !== currentUser.id);
          return {
            ...c,
            members: remainingMembers
          };
        })
      );
    } else {
      // Regular member leaving
      setBookClubs(prevClubs => 
        prevClubs.map(c => 
          c.id === clubId
            ? { ...c, members: c.members.filter(id => id !== currentUser.id) }
            : c
        )
      );
    }
    
    // Remove club from user's joined clubs
    setCurrentUser(prevUser => ({
      ...prevUser,
      joinedClubs: prevUser.joinedClubs.filter(id => id !== clubId)
    }));
    
    return true;
  };

  // Update book for a book club
  const updateCurrentBook = (clubId: string, bookId: string): boolean => {
    // Check if user is admin/creator of the club
    const club = bookClubs.find(c => c.id === clubId);
    if (!club || club.members[0] !== currentUser.id) {
      return false;
    }
    
    setBookClubs(prevClubs => 
      prevClubs.map(club => {
        if (club.id !== clubId) return club;
        
        // Add the old current book to the history list if available
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
    
    return true;
  };

  // Send a new message
  const sendMessage = (clubId: string, content: string): boolean => {
    if (!content.trim() || !isClubMember(clubId)) return false;
    
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

  // Update username
  const updateUserName = (newName: string): boolean => {
    if (!newName.trim()) return false;
    
    setCurrentUser(prevUser => ({
      ...prevUser,
      name: newName
    }));
    
    return true;
  };

  // Find a specific book club
  const getBookClub = (clubId: string): BookClub | null => {
    return bookClubs.find(club => club.id === clubId) || null;
  };

  // Check if the user is a member of a club
  const isClubMember = (clubId: string): boolean => {
    return currentUser.joinedClubs.includes(clubId);
  };

  // Filter book clubs based on a search query
  const searchBookClubs = (query: string): BookClub[] => {
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
