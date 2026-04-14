import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Client, Master, Procedure, Position, Location } from '../types';
import type { ServiceResponse, ProcedureFilters } from '../types/dto';
import { clientsService } from '../services/supabase/clients.service';
import { mastersService } from '../services/supabase/masters.service';
import { proceduresService } from '../services/supabase/procedures.service';
import { locationsService } from '../services/supabase/locations.service';

const PROCEDURES_PAGE_SIZE = 20;

interface AppState {
  // ── Data ──────────────────────────────────────────────────
  clients: Client[];
  masters: Master[];
  /**
   * The current loaded batch of procedures.
   * This is already server-filtered (location, filters, search).
   * New pages are appended; resetting replaces the list entirely.
   */
  procedures: Procedure[];
  services: ServiceResponse[];
  locations: Location[];
  dataLoaded: boolean;

  // ── Procedures pagination ─────────────────────────────────
  proceduresPage: number;
  proceduresHasMore: boolean;
  /** True while any procedures fetch is in-flight. */
  proceduresLoading: boolean;

  // ── Active location ───────────────────────────────────────
  activeLocationId: string | null;

  // ── Search & Filters ──────────────────────────────────────
  homeSearch: string;
  procedureFilters: ProcedureFilters;
  clientFilter: string;
  clientSearch: string;
  masterSearch: string;

  // ── Error state ───────────────────────────────────────────
  /** Set when loadAllData or loadProceduresPage fails. Cleared on the next successful load. */
  loadError: string | null;

  // ── UI state ──────────────────────────────────────────────
  filterSheetOpen: boolean;

  // ── Actions ───────────────────────────────────────────────
  /** Initial bootstrap: load clients, masters, locations, then first procedure page. */
  loadAllData: () => Promise<void>;

  /**
   * Load the next page of procedures (or reset to page 0 when reset=true).
   * Reads current filters / search / location from the store automatically.
   * Safe to call repeatedly; no-ops when already loading or no more pages.
   */
  loadProceduresPage: (reset?: boolean) => Promise<void>;

  // Location actions
  addLocation: (location: Omit<Location, 'id'>) => Promise<Location>;
  updateLocation: (id: string, data: Partial<Location>) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
  /** Changing the active location resets and reloads procedures. */
  setActiveLocationId: (id: string | null) => void;

  // Client actions
  setClients: (clients: Client[]) => void;
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;

  // Master actions
  setMasters: (masters: Master[]) => void;
  addMaster: (master: Omit<Master, 'id'>) => Promise<Master>;
  updateMaster: (id: string, data: Partial<Master>) => Promise<void>;
  removeMaster: (id: string) => Promise<void>;

  // Procedure actions
  setProcedures: (procedures: Procedure[]) => void;
  addProcedure: (procedure: Omit<Procedure, 'id'>) => Promise<Procedure>;
  updateProcedure: (id: string, data: Partial<Procedure>) => Promise<void>;
  removeProcedure: (id: string) => Promise<void>;

  // Service actions
  setServices: (services: ServiceResponse[]) => void;
  addService: (service: ServiceResponse) => void;

  // Filter actions
  /** Updates search text and debounces a full procedure list reset + reload. */
  setHomeSearch: (search: string) => void;
  /** Applying filters resets and reloads procedures immediately. */
  setProcedureFilters: (filters: ProcedureFilters) => void;
  setClientFilter: (filter: string | 'All') => void;
  setClientSearch: (search: string) => void;
  setMasterSearch: (search: string) => void;
  setFilterSheetOpen: (open: boolean) => void;
  clearLoadError: () => void;

  // Getters
  getClientById: (id: string) => Client | undefined;
  getMasterById: (id: string) => Master | undefined;
  getProcedureById: (id: string) => Procedure | undefined;
  getLocationById: (id: string) => Location | undefined;
  getClientProcedures: (clientId: string) => Procedure[];
  getMasterProcedures: (masterId: string) => Procedure[];
  getFilteredClients: () => Client[];
  getFilteredMasters: () => Master[];
  getMastersForLocation: (locationId: string) => Master[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      // Timer scoped to this store factory instance — survives Fast Refresh correctly.
      let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

      return {
      // ── Initial state ──────────────────────────────────────
      clients: [],
      masters: [],
      procedures: [],
      services: [],
      locations: [],
      dataLoaded: false,

      proceduresPage: 0,
      proceduresHasMore: true,
      proceduresLoading: false,

      loadError: null,

      activeLocationId: null,

      homeSearch: '',
      procedureFilters: {},
      clientFilter: 'All',
      clientSearch: '',
      masterSearch: '',
      filterSheetOpen: false,

      // ── Bootstrap ─────────────────────────────────────────
      loadAllData: async () => {
        try {
          const [clients, masters, locations] = await Promise.all([
            clientsService.getAll(),
            mastersService.getAll(),
            locationsService.getAll(),
          ]);
          // Set reference data first so search can resolve IDs on the first page load.
          set({ clients, masters, locations, loadError: null });
          await get().loadProceduresPage(true);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to load data';
          set({ dataLoaded: true, loadError: msg });
        }
      },

      // ── Procedures pagination ─────────────────────────────
      loadProceduresPage: async (reset = false) => {
        const {
          proceduresPage,
          proceduresHasMore,
          proceduresLoading,
          activeLocationId,
          procedureFilters,
          homeSearch,
          clients,
          masters,
        } = get();

        if (proceduresLoading) return;
        if (!reset && !proceduresHasMore) return;

        const page = reset ? 0 : proceduresPage;
        set({ proceduresLoading: true });

        // Resolve text search to IDs from in-memory reference data.
        // Clients and masters are fully loaded (small datasets), so matching
        // locally and passing IDs to the server is fast and accurate.
        let clientIds: string[] | undefined;
        let masterIds: string[] | undefined;

        if (homeSearch) {
          const q = homeSearch.toLowerCase();
          clientIds = clients
            .filter((c) => c.name.toLowerCase().includes(q))
            .map((c) => c.id);
          masterIds = masters
            .filter((m) => m.name.toLowerCase().includes(q))
            .map((m) => m.id);
        }

        try {
          const { data, hasMore } = await proceduresService.getPaged({
            page,
            limit: PROCEDURES_PAGE_SIZE,
            locationId: activeLocationId,
            masterId: procedureFilters.masterId,
            clientId: procedureFilters.clientId,
            position: procedureFilters.position,
            dateFrom: procedureFilters.dateFrom,
            dateTo: procedureFilters.dateTo,
            search: homeSearch || undefined,
            clientIds,
            masterIds,
          });

          set((s) => ({
            procedures: reset ? data : [...s.procedures, ...data],
            proceduresPage: page + 1,
            proceduresHasMore: hasMore,
            proceduresLoading: false,
            dataLoaded: true,
            loadError: null,
          }));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to load procedures';
          set({ proceduresLoading: false, dataLoaded: true, loadError: msg });
        }
      },

      // ── Location actions ──────────────────────────────────
      addLocation: async (location) => {
        const created = await locationsService.create(location);
        set((s) => ({ locations: [...s.locations, created] }));
        return created;
      },
      updateLocation: async (id, data) => {
        const updated = await locationsService.update(id, data);
        set((s) => ({
          locations: s.locations.map((l) => (l.id === id ? updated : l)),
        }));
      },
      removeLocation: async (id) => {
        await locationsService.delete(id);
        set((s) => ({
          locations: s.locations.filter((l) => l.id !== id),
          activeLocationId: s.activeLocationId === id ? null : s.activeLocationId,
        }));
      },
      setActiveLocationId: (activeLocationId) => {
        set({ activeLocationId });
        get().loadProceduresPage(true);
      },

      // ── Client actions ────────────────────────────────────
      setClients: (clients) => set({ clients }),
      addClient: async (client) => {
        const created = await clientsService.create(client);
        set((s) => ({ clients: [created, ...s.clients] }));
        return created;
      },
      updateClient: async (id, data) => {
        const updated = await clientsService.update(id, data);
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? updated : c)),
        }));
      },
      removeClient: async (id) => {
        await clientsService.delete(id);
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
      },

      // ── Master actions ────────────────────────────────────
      setMasters: (masters) => set({ masters }),
      addMaster: async (master) => {
        const created = await mastersService.create(master);
        set((s) => ({ masters: [created, ...s.masters] }));
        return created;
      },
      updateMaster: async (id, data) => {
        const updated = await mastersService.update(id, data);
        set((s) => ({
          masters: s.masters.map((m) => (m.id === id ? updated : m)),
        }));
      },
      removeMaster: async (id) => {
        await mastersService.delete(id);
        set((s) => ({ masters: s.masters.filter((m) => m.id !== id) }));
      },

      // ── Procedure actions ─────────────────────────────────
      setProcedures: (procedures) => set({ procedures }),
      addProcedure: async (procedure) => {
        const created = await proceduresService.create(procedure);
        // Prepend so the new item appears at the top without a full reload.
        set((s) => ({ procedures: [created, ...s.procedures] }));
        return created;
      },
      updateProcedure: async (id, data) => {
        const updated = await proceduresService.update(id, data);
        set((s) => ({
          procedures: s.procedures.map((p) => (p.id === id ? updated : p)),
        }));
      },
      removeProcedure: async (id) => {
        await proceduresService.delete(id);
        set((s) => ({ procedures: s.procedures.filter((p) => p.id !== id) }));
      },

      // ── Service actions ───────────────────────────────────
      setServices: (services) => set({ services }),
      addService: (service) =>
        set((s) => ({ services: [...s.services, service] })),

      // ── Filter actions ────────────────────────────────────
      setHomeSearch: (homeSearch) => {
        set({ homeSearch });
        // Debounce so we don't fire a request on every keystroke.
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          get().loadProceduresPage(true);
        }, 400);
      },
      setProcedureFilters: (procedureFilters) => {
        set({ procedureFilters });
        get().loadProceduresPage(true);
      },
      setClientFilter: (clientFilter) => set({ clientFilter }),
      setClientSearch: (clientSearch) => set({ clientSearch }),
      setMasterSearch: (masterSearch) => set({ masterSearch }),
      setFilterSheetOpen: (filterSheetOpen) => set({ filterSheetOpen }),
      clearLoadError: () => set({ loadError: null }),

      // ── Getters ───────────────────────────────────────────
      getClientById: (id) => get().clients.find((c) => c.id === id),
      getMasterById: (id) => get().masters.find((m) => m.id === id),
      getProcedureById: (id) => get().procedures.find((p) => p.id === id),
      getLocationById: (id) => get().locations.find((l) => l.id === id),
      getClientProcedures: (clientId) =>
        get().procedures.filter((p) => p.clientId === clientId),
      getMasterProcedures: (masterId) =>
        get().procedures.filter((p) => p.masterId === masterId),

      getFilteredClients: () => {
        const { clients, clientFilter, clientSearch } = get();
        let filtered = [...clients];

        if (clientSearch) {
          const q = clientSearch.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.phone.includes(q) ||
              c.email?.toLowerCase().includes(q),
          );
        }

        return filtered;
      },

      getFilteredMasters: () => {
        const { masters, masterSearch, activeLocationId } = get();
        let filtered = activeLocationId
          ? masters.filter((m) => m.locationIds?.includes(activeLocationId))
          : masters;

        if (masterSearch) {
          const q = masterSearch.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.positions.some((p) => p.toLowerCase().includes(q)),
          );
        }

        return filtered;
      },

      getMastersForLocation: (locationId) =>
        get().masters.filter((m) => m.locationIds?.includes(locationId)),
      };
    },
    {
      name: 'lumisalon-app',
      version: 4,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeLocationId: state.activeLocationId,
      }),
    },
  ),
);
