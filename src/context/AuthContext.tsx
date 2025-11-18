import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { authService } from '../services/authService';

type UserRole = 'asesor_comercial' | 'usuario_registrado';

interface Profile {
  id: string;
  user_id: string;
  rol: UserRole;
  nombre?: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  signUp(email: string, password: string, nombre?: string): Promise<{ success: boolean; error?: string }>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }>;
  refreshProfile(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id,user_id,rol,nombre')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile', error);
    return null;
  }

  if (!data) {
    // Ensure default profile is created for backwards compatibility
    const defaultProfile: Omit<Profile, 'id'> = {
      user_id: userId,
      rol: 'usuario_registrado',
      nombre: null,
    };
    const { data: inserted, error: insertError } = await supabase
      .from('perfiles')
      .insert(defaultProfile)
      .select('id,user_id,rol,nombre')
      .single();

    if (insertError) {
      console.error('Error creating default profile', insertError);
      return null;
    }

    return inserted;
  }

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSessionChange = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (nextSession?.user?.id) {
      const userProfile = await fetchProfile(nextSession.user.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          await handleSessionChange(data.session);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      handleSessionChange(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (!result.success) return result;
    await handleSessionChange(result.userSession ?? null);
    return { success: true } as const;
  }, [handleSessionChange]);

  const signUp = useCallback(async (email: string, password: string, nombre?: string) => {
    const result = await authService.signUp(email, password, nombre);
    if (!result.success) return result;
    await handleSessionChange(result.userSession ?? null);
    return { success: true } as const;
  }, [handleSessionChange]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    await handleSessionChange(null);
  }, [handleSessionChange]);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://mbttsrvbrwsmbcknuvfc.supabase.co/auth/v1/callback',
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true } as const;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      const nextProfile = await fetchProfile(session.user.id);
      setProfile(nextProfile);
    }
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    refreshProfile,
  }), [session, profile, loading, signIn, signUp, signOut, requestPasswordReset, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

