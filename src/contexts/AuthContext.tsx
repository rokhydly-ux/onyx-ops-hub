"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define a generic user object. We don't know the exact structure of the 'leads' table.
interface User {
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for session on initial load
    try {
      const session = localStorage.getItem('onyx_session');
      if (session) {
        setUser(JSON.parse(session));
      }
    } catch (error) {
      console.error('Failed to parse session from localStorage', error);
      localStorage.removeItem('onyx_session');
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('onyx_session', JSON.stringify(userData));
    setUser(userData);
    router.push('/hub');
  };

  const logout = () => {
    localStorage.removeItem('onyx_session');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (newUserData: User) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('onyx_session', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
