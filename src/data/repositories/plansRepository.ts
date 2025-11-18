import { Plan } from '../../domain/models/Plan';
import { supabase } from '../../services/supabase';
import { uploadPlanImage, removeImage } from '../../services/storageService';

export type PlanInput = Omit<Plan, 'id' | 'imagen_path'> & {
  imagenUri?: string | null;
};

export class PlansRepository {

  // ------------------------------
  // GETTERS
  // ------------------------------

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

  // ------------------------------
  // CREATE
  // ------------------------------

  async create(input: PlanInput) {
    let imagePath: string | null = null;

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
      activo: input.activo ?? true,
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

  // ------------------------------
  // UPDATE
  // ------------------------------

  async update(id: string, input: PlanInput) {
    const existing = await this.getPlanById(id);
    let imagePath = existing.imagen_path;

    // 👇 subir nueva imagen si viene
    if (input.imagenUri) {
      imagePath = await uploadPlanImage(input.imagenUri, existing.imagen_path ?? undefined);
    }

    // 👇 mejor manejo de fields: se respeta "undefined" como "no cambiar"
    const field = <T>(newValue: T | undefined, oldValue: T) =>
      newValue !== undefined ? newValue : oldValue;

    const payload = {
      nombre: field(input.nombre, existing.nombre),
      precio: field(input.precio, existing.precio),
      descripcion: field(input.descripcion, existing.descripcion),
      segmento: field(input.segmento, existing.segmento),
      publico_objetivo: field(input.publico_objetivo, existing.publico_objetivo),
      datos_moviles: field(input.datos_moviles, existing.datos_moviles),
      minutos_voz: field(input.minutos_voz, existing.minutos_voz),
      sms: field(input.sms, existing.sms),
      velocidad: field(input.velocidad, existing.velocidad),
      redes_sociales: field(input.redes_sociales, existing.redes_sociales),
      whatsapp: field(input.whatsapp, existing.whatsapp),
      llamadas_internacionales: field(input.llamadas_internacionales, existing.llamadas_internacionales),
      roaming: field(input.roaming, existing.roaming),
      activo: field(input.activo, existing.activo),
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

  // ------------------------------
  // DELETE
  // ------------------------------

  async delete(id: string) {
    const existing = await this.getPlanById(id);

    const { error } = await supabase
      .from('planes_moviles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // borrar imagen si existe
    if (existing?.imagen_path) {
      await removeImage(existing.imagen_path);
    }
  }

  // ------------------------------
  // REALTIME
  // ------------------------------

  /**
   * Suscripción Realtime que refresca la vista cuando:
   * INSERT / UPDATE / DELETE ocurren en planes_moviles
   */
  subscribeToChanges(callback: () => void) {
    const channel = supabase
      .channel('planes_moviles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'planes_moviles' },
        (payload) => {
          console.log('🔔 Realtime event:', payload.eventType, payload);
          callback();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn('Error removing channel:', e);
      }
    };
  }
}
