import { supabase } from '../../lib/supabase';
import type { Master, Position } from '../../types';

type Row = {
  id: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  positions: string[];
  clients_served: number;
  location_ids: string[];
};

const fromRow = (row: Row): Master => ({
  id: row.id,
  name: row.name,
  phone: row.phone ?? undefined,
  avatar: row.avatar ?? undefined,
  positions: row.positions as Position[],
  clientsServed: row.clients_served,
  locationIds: row.location_ids,
});

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

export const mastersService = {
  getAll: async (): Promise<Master[]> => {
    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },

  create: async (master: Omit<Master, 'id'>): Promise<Master> => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('masters')
      .insert({
        user_id,
        name: master.name,
        phone: master.phone ?? null,
        avatar: master.avatar ?? null,
        positions: master.positions,
        clients_served: master.clientsServed,
        location_ids: master.locationIds,
      })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as Row);
  },

  update: async (id: string, updates: Partial<Master>): Promise<Master> => {
    const user_id = await getUserId();
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.phone !== undefined) patch.phone = updates.phone ?? null;
    if (updates.avatar !== undefined) patch.avatar = updates.avatar ?? null;
    if (updates.positions !== undefined) patch.positions = updates.positions;
    if (updates.clientsServed !== undefined) patch.clients_served = updates.clientsServed;
    if (updates.locationIds !== undefined) patch.location_ids = updates.locationIds;

    const { data, error } = await supabase
      .from('masters')
      .update(patch)
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
      .from('masters')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
  },
};
