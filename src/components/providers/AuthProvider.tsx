'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/auth/AuthModal';

type User = any;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: (message?: string) => void;
  hideAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  showAuthModal: () => {},
  hideAuthModal: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | undefined>();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setIsModalOpen(false); // Close modal on successful auth
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const showAuthModal = (message?: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const hideAuthModal = () => {
    setIsModalOpen(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, showAuthModal, hideAuthModal, signOut }}>
      {children}
      <AuthModal isOpen={isModalOpen} onClose={hideAuthModal} message={modalMessage} />
    </AuthContext.Provider>
  );
}
