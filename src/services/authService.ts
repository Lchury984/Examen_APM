import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthResponse = {
  success: boolean;
  error?: string;
  userSession?: Session | null;
};

type UserRole = 'asesor_comercial' | 'usuario_registrado';

async function ensureProfile(
  userId: string, 
  nombre?: string | null, 
  telefono?: string | null,
  rol?: UserRole
) {
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
      rol: rol ?? 'usuario_registrado',
      nombre: nombre ?? null,
      telefono: telefono ?? null,
    });

  if (insertError) throw insertError;
}

export const authService = {
  async signUp(
    email: string, 
    password: string, 
    nombre?: string,
    telefono?: string,
    rol?: UserRole
  ): Promise<AuthResponse> {
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
        await ensureProfile(data.user.id, nombre, telefono, rol);
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

  async updateProfile(userId: string, updates: { nombre?: string; telefono?: string }) {
    const { error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) throw error;
  },
};

export const authServiceInstance = authService;