import type { Client, Master, Procedure, Location } from '../types';

export const mockLocations: Location[] = [
  {
    id: 'loc1',
    name: 'Lumi Downtown',
    address: '14 Blossom St, Kyiv',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
  },
  {
    id: 'loc2',
    name: 'Lumi Podil',
    address: '32 River Lane, Kyiv',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
  },
  {
    id: 'loc3',
    name: 'Lumi Pechersk',
    address: '8 Park Blvd, Kyiv',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
  },
];

export const mockMasters: Master[] = [
  {
    id: 'm1',
    name: 'Elena Petrov',
    phone: '+1 (555) 111-0001',
    positions: ['Hair'],
    clientsServed: 142,
    locationIds: ['loc1', 'loc2'], // works at two salons
  },
  {
    id: 'm2',
    name: 'Maria Chen',
    phone: '+1 (555) 111-0002',
    positions: ['Nails'],
    clientsServed: 98,
    locationIds: ['loc1'],
  },
  {
    id: 'm3',
    name: 'Sofia Rossi',
    phone: '+1 (555) 111-0003',
    positions: ['Skin'],
    clientsServed: 76,
    locationIds: ['loc2'],
  },
  {
    id: 'm4',
    name: 'Anna Taylor',
    phone: '+1 (555) 111-0004',
    positions: ['Hair'],
    clientsServed: 64,
    locationIds: ['loc1', 'loc3'],
  },
  {
    id: 'm5',
    name: 'Yuki Tanaka',
    phone: '+1 (555) 111-0005',
    positions: ['Nails'],
    clientsServed: 53,
    locationIds: ['loc3'],
  },
  {
    id: 'm6',
    name: 'Priya Singh',
    phone: '+1 (555) 111-0006',
    positions: ['Skin'],
    clientsServed: 41,
    locationIds: ['loc2', 'loc3'],
  },
];

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Alice Brown',
    phone: '+1 (555) 234-5001',
    email: 'alice@example.com',
    lastVisit: '2026-03-15',
    category: 'Hair',
  },
  {
    id: 'c2',
    name: 'Bob Carter',
    phone: '+1 (555) 234-5002',
    lastVisit: '2026-03-10',
    category: 'Nails',
  },
  {
    id: 'c3',
    name: 'Carol Davis',
    phone: '+1 (555) 234-5003',
    email: 'carol@example.com',
    lastVisit: '2026-04-01',
    category: 'Skin',
  },
  {
    id: 'c4',
    name: 'David Evans',
    phone: '+1 (555) 234-5004',
    lastVisit: '2026-02-28',
    category: 'Hair',
  },
  {
    id: 'c5',
    name: 'Emma Foster',
    phone: '+1 (555) 234-5005',
    lastVisit: '2026-03-20',
    category: 'Nails',
  },
  {
    id: 'c6',
    name: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'sarah@example.com',
    lastVisit: '2026-03-28',
    category: 'Hair',
  },
  {
    id: 'c7',
    name: 'Emily Chen',
    phone: '+1 (555) 234-5679',
    lastVisit: '2026-03-25',
    category: 'Nails',
  },
];

// Picsum photos for mock gallery — stable, fast, royalty-free
const gallery = {
  hair: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80',
  ],
  nails: [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80',
    'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=80',
  ],
  skin: [
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
  ],
};

export const mockProcedures: Procedure[] = [
  {
    id: 'p1',
    clientId: 'c6',
    masterId: 'm1',
    locationId: 'loc1',
    date: '2026-03-28T14:30:00',
    services: ['Hair Coloring'],
    positions: ['Hair'],
    notes: 'Client requested warm golden blonde. Used shade #7G.',
    photos: gallery.hair,
  },
  {
    id: 'p2',
    clientId: 'c7',
    masterId: 'm2',
    locationId: 'loc1',
    date: '2026-03-25T10:00:00',
    services: ['Gel Manicure'],
    positions: ['Nails'],
    notes: 'French tips with accent nail art.',
    photos: gallery.nails,
  },
  {
    id: 'p3',
    clientId: 'c1',
    masterId: 'm1',
    locationId: 'loc2',
    date: '2026-03-15T11:00:00',
    services: ['Haircut', 'Blow Dry'],
    positions: ['Hair'],
    photos: [gallery.hair[2], gallery.hair[3]],
  },
  {
    id: 'p4',
    clientId: 'c2',
    masterId: 'm2',
    locationId: 'loc1',
    date: '2026-03-10T15:00:00',
    services: ['Hardware Manicure', 'Gel Polish'],
    positions: ['Nails'],
    notes: 'Used shade #45, almond shape, client requested extra cuticle oil.',
    photos: [gallery.nails[0], gallery.nails[2]],
  },
  {
    id: 'p5',
    clientId: 'c3',
    masterId: 'm3',
    locationId: 'loc2',
    date: '2026-04-01T09:00:00',
    services: ['Facial Treatment'],
    positions: ['Skin'],
    photos: gallery.skin,
  },
  {
    id: 'p6',
    clientId: 'c4',
    masterId: 'm4',
    locationId: 'loc3',
    date: '2026-02-28T13:00:00',
    services: ['Haircut'],
    positions: ['Hair'],
    photos: [gallery.hair[0]],
  },
  {
    id: 'p7',
    clientId: 'c5',
    masterId: 'm5',
    locationId: 'loc3',
    date: '2026-03-20T16:00:00',
    services: ['Pedicure'],
    positions: ['Nails'],
    photos: [gallery.nails[1], gallery.nails[2]],
  },
];
