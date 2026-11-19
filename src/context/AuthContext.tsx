import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../db/storage';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  allUsers: User[];
  loginAs: (userId: string) => void;
  setRoleGuest: () => void;
  isOwner: boolean;
  isDelivery: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'aquaflow_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user session', e);
    }
    // Default to Owner for initial review or easily toggleable
    return INITIAL_USERS[0]; // Owner Admin
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const loginAs = (userId: string) => {
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const setRoleGuest = () => {
    setCurrentUser(null);
  };

  const role: UserRole = currentUser ? currentUser.role : 'customer';

  const value: AuthContextType = {
    currentUser,
    role,
    allUsers: INITIAL_USERS,
    loginAs,
    setRoleGuest,
    isOwner: role === 'owner',
    isDelivery: role === 'delivery',
    isCustomer: role === 'customer' || !currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
