export interface Plan {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string | null;
  activo: boolean;
  imagen_path?: string;
  segmento?: string | null;
  publico_objetivo?: string | null;
  datos_moviles?: string | null;
  minutos_voz?: string | null;
  sms?: string | null;
  velocidad?: string | null;
  redes_sociales?: string | null;
  whatsapp?: string | null;
  llamadas_internacionales?: string | null;
  roaming?: string | null;
  promocion?: string | null; // NUEVO CAMPO
}
