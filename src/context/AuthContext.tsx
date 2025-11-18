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
  telefono?: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  signUp(email: string, password: string, nombre?: string, telefono?: string, rol?: UserRole): Promise<{ success: boolean; error?: string }>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }>;
  updateProfile(updates: { nombre?: string; telefono?: string }): Promise<{ success: boolean; error?: string }>;
  refreshProfile(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id,user_id,rol,nombre,telefono')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile', error);
    return null;
  }

  if (!data) {
    const defaultProfile: Omit<Profile, 'id'> = {
      user_id: userId,
      rol: 'usuario_registrado',
      nombre: null,
      telefono: null,
    };
    const { data: inserted, error: insertError } = await supabase
      .from('perfiles')
      .insert(defaultProfile)
      .select('id,user_id,rol,nombre,telefono')
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

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    nombre?: string,
    telefono?: string,
    rol?: UserRole
  ) => {
    const result = await authService.signUp(email, password, nombre, telefono, rol);
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

  const updateProfile = useCallback(async (updates: { nombre?: string; telefono?: string }) => {
    if (!session?.user?.id) {
      return { success: false, error: 'No hay sesión activa' };
    }
    
    try {
      await authService.updateProfile(session.user.id, updates);
      await refreshProfile();
      return { success: true } as const;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [session?.user?.id]);

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
    updateProfile,
    refreshProfile,
  }), [session, profile, loading, signIn, signUp, signOut, requestPasswordReset, updateProfile, refreshProfile]);

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