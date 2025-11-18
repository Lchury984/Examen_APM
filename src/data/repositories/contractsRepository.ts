import { supabase } from '../../services/supabase';

export type Contract = {
  id: string;
  user_id: string;
  plan_id: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso';
  created_at: string;
  room_id?: string;
  planes_moviles?: {
    nombre: string;
    precio: number;
  };
  user_profile?: {
    nombre: string | null;
    telefono: string | null;
    email?: string;
  };
};

export class ContractsRepository {
  async create(planId: string, userId: string) {
    const { data, error } = await supabase
      .from('contrataciones')
      .insert({
        plan_id: planId,
        user_id: userId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Contract;
  }

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(nombre, precio)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Contract[];
  }

  async getPendings() {
    // Primero obtenemos las contrataciones
    const { data: contrataciones, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(nombre, precio)
      `)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!contrataciones) return [];

    // Luego obtenemos los perfiles de los usuarios
    const userIds = contrataciones.map(c => c.user_id);
    const { data: perfiles } = await supabase
      .from('perfiles')
      .select('user_id, nombre, telefono')
      .in('user_id', userIds);

    // Y los emails de auth.users
    const { data: { users } } = await supabase.auth.admin.listUsers();
    
    // Combinamos la información
    const result = contrataciones.map(contratacion => {
      const perfil = perfiles?.find(p => p.user_id === contratacion.user_id);
      const user = users?.find(u => u.id === contratacion.user_id);
      
      return {
        ...contratacion,
        user_profile: {
          nombre: perfil?.nombre ?? null,
          telefono: perfil?.telefono ?? null,
          email: user?.email ?? 'Sin email',
        }
      };
    });

    return result as Contract[];
  }

  async updateStatus(id: string, estado: Contract['estado']) {
    const { data, error } = await supabase
      .from('contrataciones')
      .update({ estado })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as Contract;
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('contrataciones')
      .select(`
        *,
        planes_moviles(nombre, precio)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Contract;
  }
}