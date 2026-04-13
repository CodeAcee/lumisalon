import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Client, Master, Procedure, Position, Location } from '../types';
import type { ServiceResponse, ProcedureFilters } from '../types/dto';
import { clientsService } from '../services/supabase/clients.service';
import { mastersService } from '../services/supabase/masters.service';
import { proceduresService } from '../services/supabase/procedures.service';
import { locationsService } from '../services/supabase/locations.service';

interface AppState {
  // Data
  clients: Client[];
  masters: Master[];
  procedures: Procedure[];
  services: ServiceResponse[];
  locations: Location[];
  dataLoaded: boolean;

  // Active location (null = All locations)
  activeLocationId: string | null;

  // Search & Filters
  homeSearch: string;
  procedureFilters: ProcedureFilters;
  clientFilter: string;
  clientSearch: string;
  masterSearch: string;

  // UI state
  filterSheetOpen: boolean;

  // Load all data from Supabase
  loadAllData: () => Promise<void>;

  // Location actions
  addLocation: (location: Omit<Location, 'id'>) => Promise<Location>;
  updateLocation: (id: string, data: Partial<Location>) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
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
  setHomeSearch: (search: string) => void;
  setProcedureFilters: (filters: ProcedureFilters) => void;
  setClientFilter: (filter: string | 'All') => void;
  setClientSearch: (search: string) => void;
  setMasterSearch: (search: string) => void;
  setFilterSheetOpen: (open: boolean) => void;

  // Getters
  getClientById: (id: string) => Client | undefined;
  getMasterById: (id: string) => Master | undefined;
  getProcedureById: (id: string) => Procedure | undefined;
  getLocationById: (id: string) => Location | undefined;
  getClientProcedures: (clientId: string) => Procedure[];
  getMasterProcedures: (masterId: string) => Procedure[];
  getFilteredProcedures: () => Procedure[];
  getFilteredClients: () => Client[];
  getFilteredMasters: () => Master[];
  getMastersForLocation: (locationId: string) => Master[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Data — starts empty, loaded from Supabase after login
      clients: [],
      masters: [],
      procedures: [],
      services: [],
      locations: [],
      dataLoaded: false,

      activeLocationId: null,

      homeSearch: '',
      procedureFilters: {},
      clientFilter: 'All',
      clientSearch: '',
      masterSearch: '',
      filterSheetOpen: false,

      // Load all data from Supabase
      loadAllData: async () => {
        try {
          const [clients, masters, procedures, locations] = await Promise.all([
            clientsService.getAll(),
            mastersService.getAll(),
            proceduresService.getAll(),
            locationsService.getAll(),
          ]);
          set({ clients, masters, procedures, locations, dataLoaded: true });
        } catch {
          set({ dataLoaded: true });
        }
      },

      // Location actions
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
      setActiveLocationId: (activeLocationId) => set({ activeLocationId }),

      // Client actions
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

      // Master actions
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

      // Procedure actions
      setProcedures: (procedures) => set({ procedures }),
      addProcedure: async (procedure) => {
        const created = await proceduresService.create(procedure);
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

      // Service actions
      setServices: (services) => set({ services }),
      addService: (service) =>
        set((s) => ({ services: [...s.services, service] })),

      // Filter actions
      setHomeSearch: (homeSearch) => set({ homeSearch }),
      setProcedureFilters: (procedureFilters) => set({ procedureFilters }),
      setClientFilter: (clientFilter) => set({ clientFilter }),
      setClientSearch: (clientSearch) => set({ clientSearch }),
      setMasterSearch: (masterSearch) => set({ masterSearch }),
      setFilterSheetOpen: (filterSheetOpen) => set({ filterSheetOpen }),

      // Getters
      getClientById: (id) => get().clients.find((c) => c.id === id),
      getMasterById: (id) => get().masters.find((m) => m.id === id),
      getProcedureById: (id) => get().procedures.find((p) => p.id === id),
      getLocationById: (id) => get().locations.find((l) => l.id === id),
      getClientProcedures: (clientId) =>
        get().procedures.filter((p) => p.clientId === clientId),
      getMasterProcedures: (masterId) =>
        get().procedures.filter((p) => p.masterId === masterId),

      getFilteredProcedures: () => {
        const { procedures, procedureFilters, homeSearch, clients, masters, activeLocationId } = get();
        let filtered = [...procedures];

        if (activeLocationId) {
          const locationMasterIds = new Set(
            masters
              .filter((m) => m.locationIds?.includes(activeLocationId))
              .map((m) => m.id),
          );
          filtered = filtered.filter(
            (p) =>
              p.locationId === activeLocationId ||
              locationMasterIds.has(p.masterId),
          );
        }

        if (homeSearch) {
          const q = homeSearch.toLowerCase();
          filtered = filtered.filter((p) => {
            const client = clients.find((c) => c.id === p.clientId);
            const master = masters.find((m) => m.id === p.masterId);
            return (
              client?.name.toLowerCase().includes(q) ||
              master?.name.toLowerCase().includes(q) ||
              p.services.some((s) => s.toLowerCase().includes(q))
            );
          });
        }

        if (procedureFilters.masterId) {
          filtered = filtered.filter((p) => p.masterId === procedureFilters.masterId);
        }
        if (procedureFilters.clientId) {
          filtered = filtered.filter((p) => p.clientId === procedureFilters.clientId);
        }
        if (procedureFilters.position) {
          filtered = filtered.filter((p) =>
            p.positions.includes(procedureFilters.position!),
          );
        }
        if (procedureFilters.dateFrom) {
          filtered = filtered.filter((p) => p.date >= procedureFilters.dateFrom!);
        }
        if (procedureFilters.dateTo) {
          filtered = filtered.filter((p) => p.date <= procedureFilters.dateTo!);
        }

        return filtered;
      },

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
    }),
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
