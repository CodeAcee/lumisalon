import { supabase } from '../../lib/supabase';

const BUCKET = 'images';

/**
 * Returns true if the URI is a valid remote URL (http/https).
 * Use this before displaying an image — file:// URIs from old records
 * won't load on any device other than the one that created them.
 */
export function isRemoteUri(uri: string | undefined | null): boolean {
  return !!uri && uri.startsWith('http');
}

export const STORAGE_LIMITS = {
  procedurePhoto: 5 * 1024 * 1024,  // 5 MB
  masterAvatar:   2 * 1024 * 1024,  // 2 MB
  locationImage:  3 * 1024 * 1024,  // 3 MB
} as const;

/**
 * Upload a local file:// URI to Supabase Storage.
 * Uses ArrayBuffer — the most reliable approach in React Native.
 * Returns the public HTTPS URL of the uploaded file.
 */
export async function uploadImage(
  localUri: string,
  folder: 'procedures' | 'masters' | 'locations' | 'profiles',
  limitBytes: number = STORAGE_LIMITS.procedurePhoto,
): Promise<string> {
  // Already a remote URL — skip upload (e.g. existing photo on edit)
  if (localUri.startsWith('http')) return localUri;

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength > limitBytes) {
    const mb = (limitBytes / 1024 / 1024).toFixed(0);
    throw new Error(`Image exceeds the ${mb} MB limit. Please choose a smaller file.`);
  }

  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${folder}/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: mime, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload multiple images concurrently.
 * Already-remote URLs are passed through unchanged.
 */
export async function uploadImages(
  localUris: string[],
  folder: 'procedures' | 'masters' | 'locations' | 'profiles',
  limitBytes: number = STORAGE_LIMITS.procedurePhoto,
): Promise<string[]> {
  return Promise.all(localUris.map((uri) => uploadImage(uri, folder, limitBytes)));
}

/**
 * Delete an image from Supabase Storage by its public URL.
 * Silently ignores errors (e.g. already deleted).
 */
export async function deleteImage(publicUrl: string): Promise<void> {
  try {
    const url = new URL(publicUrl);
    const parts = url.pathname.split(`/object/public/${BUCKET}/`);
    if (parts.length < 2) return;
    await supabase.storage.from(BUCKET).remove([parts[1]]);
  } catch {
    // best-effort
  }
}
