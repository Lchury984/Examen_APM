import { supabase } from './supabase';

const BUCKET = 'planes-imagenes';
const MAX_BYTES = 5 * 1024 * 1024;

async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

export async function uploadPlanImage(uri: string, previousPath?: string) {
  const blob = await uriToBlob(uri);
  if (blob.size > MAX_BYTES) {
    throw new Error('La imagen supera el límite de 5MB');
  }

  const extension = blob.type === 'image/png' ? 'png' : 'jpg';
  const filePath = `plan_${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, blob, {
    upsert: false,
    contentType: blob.type || 'image/jpeg',
  });

  if (error) {
    throw error;
  }

  if (previousPath) {
    await removeImage(previousPath).catch(() => undefined);
  }

  return filePath;
}

export async function removeImage(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export function getPublicImageUrl(path?: string | null) {
  if (!path) return undefined;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

