import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/authService';

type AppRole = 'admin' | 'manager' | 'user';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  gymId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const userRole = await authService.getUserRole(userId);
    if (userRole) setRole(userRole as AppRole);
    const profile = await authService.getUserProfile(userId);
    if (profile) setGymId(profile.gym_id);
  };

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserRole(session.user.id), 0);
      } else {
        setRole(null);
        setGymId(null);
      }
      setLoading(false);
    });

    authService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchUserRole(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    await authService.signUp(email, password, metadata);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, gymId, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
