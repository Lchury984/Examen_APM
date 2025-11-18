import { Plan } from '../../domain/models/Plan';
import { supabase } from '../../services/supabase';
import { uploadPlanImage, removeImage } from '../../services/storageService';

export type PlanInput = Omit<Plan, 'id' | 'imagen_path'> & { imagenUri?: string | null };

export class PlansRepository {
  async getActivePlans() {
    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .eq('activo', true)
      .order('precio');

    if (error) {
      console.error('Error fetching active plans:', error);
      throw error;
    }

    return (data ?? []) as Plan[];
  }

  async getAll() {
    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Plan[];
  }

  async getPlanById(id: string) {
    const { data, error } = await supabase
      .from('planes_moviles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Plan;
  }

  async create(input: PlanInput) {
    let imagePath: string | undefined;
    if (input.imagenUri) {
      imagePath = await uploadPlanImage(input.imagenUri);
    }

    const payload = {
      nombre: input.nombre,
      precio: input.precio,
      descripcion: input.descripcion ?? null,
      segmento: input.segmento ?? null,
      publico_objetivo: input.publico_objetivo ?? null,
      datos_moviles: input.datos_moviles ?? null,
      minutos_voz: input.minutos_voz ?? null,
      sms: input.sms ?? null,
      velocidad: input.velocidad ?? null,
      redes_sociales: input.redes_sociales ?? null,
      whatsapp: input.whatsapp ?? null,
      llamadas_internacionales: input.llamadas_internacionales ?? null,
      roaming: input.roaming ?? null,
      activo: input.activo,
      imagen_path: imagePath,
    };

    const { data, error } = await supabase
      .from('planes_moviles')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      if (imagePath) await removeImage(imagePath);
      throw error;
    }

    return data as Plan;
  }

  async update(id: string, input: PlanInput) {
    const existing = await this.getPlanById(id);
    let imagePath = existing.imagen_path;

    if (input.imagenUri) {
      const newPath = await uploadPlanImage(input.imagenUri, existing.imagen_path || undefined);
      imagePath = newPath;
    }

    const payload = {
      nombre: input.nombre,
      precio: input.precio,
      descripcion: input.descripcion ?? existing.descripcion ?? null,
      segmento: input.segmento ?? existing.segmento ?? null,
      publico_objetivo: input.publico_objetivo ?? existing.publico_objetivo ?? null,
      datos_moviles: input.datos_moviles ?? existing.datos_moviles ?? null,
      minutos_voz: input.minutos_voz ?? existing.minutos_voz ?? null,
      sms: input.sms ?? existing.sms ?? null,
      velocidad: input.velocidad ?? existing.velocidad ?? null,
      redes_sociales: input.redes_sociales ?? existing.redes_sociales ?? null,
      whatsapp: input.whatsapp ?? existing.whatsapp ?? null,
      llamadas_internacionales: input.llamadas_internacionales ?? existing.llamadas_internacionales ?? null,
      roaming: input.roaming ?? existing.roaming ?? null,
      activo: input.activo,
      imagen_path: imagePath,
    };

    const { data, error } = await supabase
      .from('planes_moviles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as Plan;
  }

  async delete(id: string) {
    const existing = await this.getPlanById(id);
    const { error } = await supabase
      .from('planes_moviles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    if (existing?.imagen_path) {
      await removeImage(existing.imagen_path);
    }
  }

  subscribeToChanges(callback: () => void) {
    const channel = supabase
      .channel('planes_moviles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planes_moviles' }, () => {
        callback();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}