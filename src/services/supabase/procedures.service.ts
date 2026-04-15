import { supabase } from '../../lib/supabase';
import type { Procedure, Position } from '../../types';
import { getUserId } from './utils';

type Row = {
  id: string;
  client_id: string;
  master_id: string;
  location_id: string | null;
  date: string;
  services: string[];
  service_ids: string[];
  positions: string[];
  notes: string | null;
  photos: string[];
};

const fromRow = (row: Row): Procedure => ({
  id: row.id,
  clientId: row.client_id,
  masterId: row.master_id,
  locationId: row.location_id ?? undefined,
  date: row.date,
  services: row.services,
  serviceIds: row.service_ids?.length ? row.service_ids : undefined,
  positions: row.positions as Position[],
  notes: row.notes ?? undefined,
  photos: row.photos,
});

export interface GetPagedParams {
  page: number;
  limit: number;
  locationId?: string | null;
  // Structured filters — applied server-side with AND logic
  masterId?: string;
  clientId?: string;
  position?: string;
  dateFrom?: string;
  dateTo?: string;
  // Text search support
  // clientIds / masterIds: IDs resolved from local cache matching the search term
  // search: raw term used as fallback for services text search
  search?: string;
  clientIds?: string[];
  masterIds?: string[];
}

export const proceduresService = {
  /**
   * Fetch a single page of procedures with all filters applied server-side.
   * Returns { data, hasMore } so the caller knows whether to show a load-more trigger.
   *
   * Search strategy:
   *  - Client / master name → resolved to IDs by the caller from in-memory cache
   *    and sent as `client_id IN (…) OR master_id IN (…)`
   *  - No name match → fall back to `services::text ILIKE '%q%'` (partial match on
   *    the serialised Postgres text[] array, e.g. "{Haircut,Manicure}")
   */
  getPaged: async ({
    page,
    limit,
    locationId,
    masterId,
    clientId,
    position,
    dateFrom,
    dateTo,
    search,
    clientIds,
    masterIds,
  }: GetPagedParams): Promise<{ data: Procedure[]; hasMore: boolean }> => {
    let query = supabase
      .from('procedures')
      .select('*')
      .order('date', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    if (masterId) {
      query = query.eq('master_id', masterId);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (position) {
      query = query.contains('positions', [position]);
    }
    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    if (search) {
      const orParts: string[] = [];
      if (clientIds?.length) {
        orParts.push(`client_id.in.(${clientIds.join(',')})`);
      }
      if (masterIds?.length) {
        orParts.push(`master_id.in.(${masterIds.join(',')})`);
      }

      if (orParts.length > 0) {
        // Name matches found — query by IDs
        query = query.or(orParts.join(','));
      } else {
        // No name match — search the serialised services array text
        // services::text produces e.g. "{Haircut,Manicure}" which supports ILIKE
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = (query as any).filter('services::text', 'ilike', `%${search}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return {
      data: (data as Row[]).map(fromRow),
      hasMore: data.length === limit,
    };
  },

  create: async (procedure: Omit<Procedure, 'id'>): Promise<Procedure> => {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('procedures')
      .insert({
        user_id,
        client_id: procedure.clientId,
        master_id: procedure.masterId,
        location_id: procedure.locationId ?? null,
        date: procedure.date,
        services: procedure.services,
        service_ids: procedure.serviceIds ?? [],
        positions: procedure.positions,
        notes: procedure.notes ?? null,
        photos: procedure.photos ?? [],
      })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as Row);
  },

  update: async (id: string, updates: Partial<Procedure>): Promise<Procedure> => {
    const user_id = await getUserId();
    const patch: Record<string, unknown> = {};
    if (updates.clientId !== undefined) patch.client_id = updates.clientId;
    if (updates.masterId !== undefined) patch.master_id = updates.masterId;
    if (updates.locationId !== undefined) patch.location_id = updates.locationId ?? null;
    if (updates.date !== undefined) patch.date = updates.date;
    if (updates.services !== undefined) patch.services = updates.services;
    if (updates.serviceIds !== undefined) patch.service_ids = updates.serviceIds;
    if (updates.positions !== undefined) patch.positions = updates.positions;
    if (updates.notes !== undefined) patch.notes = updates.notes ?? null;
    if (updates.photos !== undefined) patch.photos = updates.photos;

    const { data, error } = await supabase
      .from('procedures')
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
      .from('procedures')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw error;
  },

  /** Fetch all procedures for a specific client (no pagination — used on detail screens). */
  getByClientId: async (clientId: string): Promise<Procedure[]> => {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },

  /** Fetch all procedures for a specific master (no pagination — used on detail screens). */
  getByMasterId: async (masterId: string): Promise<Procedure[]> => {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('master_id', masterId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },
};
