
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch storage event to notify other tabs
      window.dispatchEvent(new StorageEvent('storage', { key }));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
      // Dispatch storage event to notify other tabs
      window.dispatchEvent(new StorageEvent('storage', { key }));
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage'));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
