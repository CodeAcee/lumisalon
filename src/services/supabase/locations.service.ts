import { supabase } from '../../lib/supabase';
import type { Location } from '../../types';

type Row = {
  id: string;
  name: string;
  address: string;
  image: string | null;
};

const fromRow = (row: Row): Location => ({
  id: row.id,
  name: row.name,
  address: row.address,
  image: row.image ?? undefined,
});

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

export const locationsService = {
  getAll: async (): Promise<Location[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },

  create: async (location: Omit<Location, 'id'>): Promise<Location> => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('locations')
      .insert({
        user_id,
        name: location.name,
        address: location.address,
        image: location.image ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as Row);
  },

  update: async (id: string, updates: Partial<Location>): Promise<Location> => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('locations')
      .update({
        name: updates.name,
        address: updates.address,
        image: updates.image ?? null,
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as Row);
  },

  delete: async (id: string): Promise<void> => {
    const user_id = await getUserId();
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
  },
};
