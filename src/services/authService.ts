import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthResponse = {
  success: boolean;
  error?: string;
  userSession?: Session | null;
};

async function ensureProfile(userId: string, nombre?: string | null) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { error: insertError } = await supabase
    .from('perfiles')
    .insert({
      user_id: userId,
      rol: 'usuario_registrado',
      nombre: nombre ?? null,
    });

  if (insertError) throw insertError;
}

export const authService = {
  async signUp(email: string, password: string, nombre?: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: nombre,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user?.id) {
      try {
        await ensureProfile(data.user.id, nombre);
      } catch (profileError: any) {
        return { success: false, error: profileError.message };
      }
    }

    return { success: true, userSession: data.session ?? null };
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, userSession: data.session ?? null };
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};

export const authServiceInstance = authService;
