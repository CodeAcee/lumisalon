import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Client, Master, Procedure, Position, Location } from '../types';
import type { ServiceResponse, ProcedureFilters } from '../types/dto';
import { mockClients, mockMasters, mockProcedures, mockLocations } from './mockData';

interface AppState {
  // Data
  clients: Client[];
  masters: Master[];
  procedures: Procedure[];
  services: ServiceResponse[];
  locations: Location[];

  // Active location (null = All locations)
  activeLocationId: string | null;

  // Search & Filters
  homeSearch: string;
  procedureFilters: ProcedureFilters;
  clientFilter: 'All';
  clientSearch: string;
  masterSearch: string;

  // UI state
  filterSheetOpen: boolean;

  // Location actions
  addLocation: (location: Location) => void;
  updateLocation: (id: string, data: Partial<Location>) => void;
  removeLocation: (id: string) => void;
  setActiveLocationId: (id: string | null) => void;

  // Client actions
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  removeClient: (id: string) => void;

  // Master actions
  setMasters: (masters: Master[]) => void;
  addMaster: (master: Master) => void;
  updateMaster: (id: string, data: Partial<Master>) => void;
  removeMaster: (id: string) => void;

  // Procedure actions
  setProcedures: (procedures: Procedure[]) => void;
  addProcedure: (procedure: Procedure) => void;
  updateProcedure: (id: string, data: Partial<Procedure>) => void;
  removeProcedure: (id: string) => void;

  // Service actions
  setServices: (services: ServiceResponse[]) => void;
  addService: (service: ServiceResponse) => void;

  // Filter actions
  setHomeSearch: (search: string) => void;
  setProcedureFilters: (filters: ProcedureFilters) => void;
  setClientFilter: (filter: ClientTag | 'All') => void;
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
  /** Returns masters filtered by search + active location */
  getFilteredMasters: () => Master[];
  /** Masters assigned to the given location */
  getMastersForLocation: (locationId: string) => Master[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Data
      clients: mockClients,
      masters: mockMasters,
      procedures: mockProcedures,
      services: [],
      locations: mockLocations,

      // No location selected by default (show All)
      activeLocationId: null,

      // Search & Filters
      homeSearch: '',
      procedureFilters: {},
      clientFilter: 'All',
      clientSearch: '',
      masterSearch: '',
      filterSheetOpen: false,

      // Location actions
      addLocation: (location) =>
        set((s) => ({ locations: [...s.locations, location] })),
      updateLocation: (id, data) =>
        set((s) => ({
          locations: s.locations.map((l) => (l.id === id ? { ...l, ...data } : l)),
        })),
      removeLocation: (id) =>
        set((s) => ({
          locations: s.locations.filter((l) => l.id !== id),
          activeLocationId: s.activeLocationId === id ? null : s.activeLocationId,
        })),
      setActiveLocationId: (activeLocationId) => set({ activeLocationId }),

      // Client actions
      setClients: (clients) => set({ clients }),
      addClient: (client) =>
        set((s) => ({ clients: [client, ...s.clients] })),
      updateClient: (id, data) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // Master actions
      setMasters: (masters) => set({ masters }),
      addMaster: (master) =>
        set((s) => ({ masters: [master, ...s.masters] })),
      updateMaster: (id, data) =>
        set((s) => ({
          masters: s.masters.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
      removeMaster: (id) =>
        set((s) => ({ masters: s.masters.filter((m) => m.id !== id) })),

      // Procedure actions
      setProcedures: (procedures) => set({ procedures }),
      addProcedure: (procedure) =>
        set((s) => ({ procedures: [procedure, ...s.procedures] })),
      updateProcedure: (id, data) =>
        set((s) => ({
          procedures: s.procedures.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      removeProcedure: (id) =>
        set((s) => ({ procedures: s.procedures.filter((p) => p.id !== id) })),

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

        // Filter by active location
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
      version: 3, // bumped: locations feature + avatar field added
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        clients: state.clients,
        masters: state.masters,
        procedures: state.procedures,
        services: state.services,
        locations: state.locations,
        activeLocationId: state.activeLocationId,
      }),
    },
  ),
);
