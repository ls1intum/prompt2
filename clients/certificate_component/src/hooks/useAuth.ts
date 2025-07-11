import { useState, useEffect } from 'react';

interface User {
  id: string;
  roles: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Mock user for development - in real app this would come from auth context
    setUser({
      id: 'mock-user-id',
      roles: ['instructor'] // or ['student']
    });
  }, []);

  return { user };
};
