import { supabase } from '../../lib/supabase';
import type { ServiceResponse, CreateServiceRequest, UpdateServiceRequest } from '../../types/dto';
import type { Position } from '../../types';
import { getUserId } from './utils';

type Row = {
  id: string;
  name: string;
  position: string;
  price: number;
  duration: number | null;
  archived: boolean;
};

const fromRow = (row: Row): ServiceResponse => ({
  id: row.id,
  name: row.name,
  position: row.position as Position,
  price: row.price,
  duration: row.duration ?? undefined,
  archived: row.archived,
});

export const servicesService = {
  /** Returns all non-archived services for the current user. */
  getAll: async (): Promise<ServiceResponse[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },

  create: async (service: CreateServiceRequest): Promise<ServiceResponse> => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('services')
      .insert({
        user_id,
        name: service.name,
        position: service.position,
        price: service.price,
        duration: service.duration ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as Row);
  },

  update: async (id: string, updates: UpdateServiceRequest): Promise<ServiceResponse> => {
    const user_id = await getUserId();
    const patch: Partial<Row> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.position !== undefined) patch.position = updates.position;
    if (updates.price !== undefined) patch.price = updates.price;
    if (updates.duration !== undefined) patch.duration = updates.duration;

    const { data, error } = await supabase
      .from('services')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as Row);
  },

  /** Soft-delete: sets archived=true so historical revenue data is preserved. */
  archive: async (id: string): Promise<void> => {
    const user_id = await getUserId();
    const { error } = await supabase
      .from('services')
      .update({ archived: true })
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
  },
};
