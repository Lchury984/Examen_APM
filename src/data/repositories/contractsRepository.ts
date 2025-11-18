import { supabase } from '../../services/supabase';

export type Contract = {
  id: string;
  user_id: string;
  plan_id: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso';
  created_at: string;
  planes_moviles?: {
    nombre: string;
    precio: number;
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
      .select('*, planes_moviles(nombre,precio)')
      .single();

    if (error) throw error;
    return data as Contract;
  }

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('contrataciones')
      .select('*, planes_moviles(nombre,precio)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Contract[];
  }

  async getPendings() {
    const { data, error } = await supabase
      .from('contrataciones')
      .select('*, planes_moviles(nombre,precio)')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Contract[];
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
}

