import { supabase } from '../../lib/supabase';
import type { Client } from '../../types';

type Row = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  avatar: string | null;
  last_visit: string | null;
  category: string | null;
  location_id: string | null;
};

const fromRow = (row: Row): Client => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email ?? undefined,
  notes: row.notes ?? undefined,
  avatar: row.avatar ?? undefined,
  lastVisit: row.last_visit ?? undefined,
  category: row.category ?? undefined,
  locationId: row.location_id ?? undefined,
});

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

export const clientsService = {
  getAll: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },

  create: async (client: Omit<Client, 'id'>): Promise<Client> => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id,
        name: client.name,
        phone: client.phone,
        email: client.email ?? null,
        notes: client.notes ?? null,
        avatar: client.avatar ?? null,
        last_visit: client.lastVisit ?? null,
        category: client.category ?? null,
        location_id: client.locationId ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as Row);
  },

  update: async (id: string, updates: Partial<Client>): Promise<Client> => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        phone: updates.phone,
        email: updates.email ?? null,
        notes: updates.notes ?? null,
        avatar: updates.avatar ?? null,
        last_visit: updates.lastVisit ?? null,
        category: updates.category ?? null,
        location_id: updates.locationId ?? null,
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
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
  },
};
