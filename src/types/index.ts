export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export type Position = 'Hair' | 'Nails' | 'Skin' | 'Lashes' | 'Lashmaker' | 'Colorist';

export interface Location {
  id: string;
  name: string;
  address: string;
  image?: string;
}

export interface Master {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  positions: Position[];
  clientsServed: number;
  /** IDs of locations this master is attached to */
  locationIds: string[];
}


export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  avatar?: string;
  lastVisit?: string;
  category?: string;
  /** ID of the salon location this client primarily visits */
  locationId?: string;
}

export interface Procedure {
  id: string;
  clientId: string;
  masterId: string;
  /** Which salon location this procedure was performed at */
  locationId?: string;
  date: string;
  services: string[];
  positions: Position[];
  notes?: string;
  photos?: string[];
}

export interface Appointment {
  id: string;
  clientName: string;
  masterName: string;
  service: string;
  date: string;
  time: string;
}
