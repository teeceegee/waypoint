import Dexie, { type Table } from 'dexie';

// --- DATA TYPES ---

export interface Trip {
  id?: number;
  slug: string; // Unique human-readable LLM ID
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  travelerId: 'graeme' | 'tony' | 'shared';
}

export interface Pass {
  id?: number;
  slug: string; // Unique human-readable LLM ID
  tripSlug: string; // Links to Trip.slug
  tripId?: number; // Resolved internally by IndexedDB
  title: string;
  type: 'flight' | 'train' | 'bus' | 'hotel' | 'restaurant' | 'activity' | 'other';
  travelerId: 'graeme' | 'tony' | 'shared';
  date: string;
  time?: string;
  location: string;
  gate?: string;
  seat?: string;
  confirmationCode?: string;
  barcodeType: 'aztec' | 'pdf417' | 'qr' | 'code128' | 'none';
  barcodeContent?: string;
  notes?: string;
  attachmentId?: number; // Linked attachment in the attachments table
}

export interface Attachment {
  id?: number;
  fileName: string;
  fileType: string;
  data: Blob;
}

export interface Profile {
  id: 'graeme' | 'tony';
  name: string;
  isDeviceOwner: boolean;
}

// --- INDEXEDDB CLASS SETUP ---

class WaypointDatabase extends Dexie {
  trips!: Table<Trip>;
  passes!: Table<Pass>;
  attachments!: Table<Attachment>;
  profiles!: Table<Profile>;

  constructor() {
    super('WaypointDatabase');
    
    // Define database schemas.
    // Version 2 adds unique string slug index support to allow LLM JSON operations.
    this.version(2).stores({
      trips: '++id, &slug, name, destination, travelerId',
      passes: '++id, &slug, tripSlug, tripId, type, travelerId, date, attachmentId',
      attachments: '++id, fileName, fileType',
      profiles: 'id, name, isDeviceOwner'
    });
  }
}

export const db = new WaypointDatabase();

// --- SEED DATA HELPER ---

export async function seedDatabase() {
  const tripCount = await db.trips.count();
  if (tripCount > 0) {
    return; // Database is already populated
  }

  console.log('Database empty. Seeding initial travel profiles, trips, and boarding passes...');

  // 1. Seed Profiles
  await db.profiles.bulkAdd([
    { id: 'tony', name: 'Tony', isDeviceOwner: true },
    { id: 'graeme', name: 'Graeme', isDeviceOwner: false }
  ]);

  // 2. Seed Trips
  const trip1Id = await db.trips.add({
    slug: 'trip-tokyo-2026',
    name: 'Summer Voyage to Tokyo',
    destination: 'Tokyo, Japan',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Starts tomorrow
    endDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // 2 weeks duration
    description: 'First joint trip to Japan! High-speed trains, sushi, and DisneySea exploration.',
    travelerId: 'shared'
  });

  const trip2Id = await db.trips.add({
    slug: 'trip-rome-2026',
    name: 'Weekend Getaway in Rome',
    destination: 'Rome, Italy',
    startDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // In 1 month
    endDate: new Date(Date.now() + 86400000 * 33).toISOString().split('T')[0],
    description: 'Express pizza tour and historical sightseeing.',
    travelerId: 'tony'
  });

  // Create a base64 dummy image/pdf attachment to demonstrate file storage
  // 1x1 Transparent pixel PNG
  const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const dummyBlob = await fetch(`data:image/png;base64,${dummyPngBase64}`).then(res => res.blob());
  
  const attachmentId = await db.attachments.add({
    fileName: 'tokyo_hotel_booking.png',
    fileType: 'image/png',
    data: dummyBlob
  });

  // 3. Seed Passes for Trip 1 (Tokyo)
  await db.passes.bulkAdd([
    // Flight for Tony
    {
      slug: 'pass-tokyo-flight-tony',
      tripSlug: 'trip-tokyo-2026',
      tripId: trip1Id,
      title: 'Flight JL042: LHR ➔ HND (Tony)',
      type: 'flight',
      travelerId: 'tony',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '09:40',
      location: 'London Heathrow (LHR) Terminal 3',
      gate: 'T3-22',
      seat: '24K',
      confirmationCode: 'JAL92X',
      barcodeType: 'pdf417',
      barcodeContent: 'M1ME/PASSENGER   EJAL92X LHRHNDJL 0042 120Y024K0043 147>2180B  6120B2                 29A00000000',
      notes: 'Departing from LHR. Baggage allowance: 2 x 23kg. Remember noise-canceling headphones!'
    },
    // Flight for Graeme
    {
      slug: 'pass-tokyo-flight-graeme',
      tripSlug: 'trip-tokyo-2026',
      tripId: trip1Id,
      title: 'Flight JL042: LHR ➔ HND (Graeme)',
      type: 'flight',
      travelerId: 'graeme',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '09:40',
      location: 'London Heathrow (LHR) Terminal 3',
      gate: 'T3-22',
      seat: '24G',
      confirmationCode: 'JAL92X',
      barcodeType: 'pdf417',
      barcodeContent: 'M1GRAEME/PASSENGER   EJAL92X LHRHNDJL 0042 120Y024G0042 147>2180B  6120B2                 29A00000000',
      notes: 'Graeme is in the aisle seat right next to Tony!'
    },
    // Shared Hotel Reservation
    {
      slug: 'pass-tokyo-hotel-shared',
      tripSlug: 'trip-tokyo-2026',
      tripId: trip1Id,
      title: 'Shibuya Stream Excel Hotel',
      type: 'hotel',
      travelerId: 'shared',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '15:00',
      location: '3-21-3 Shibuya, Shibuya-ku, Tokyo',
      confirmationCode: 'RSV-TOKYO-8821',
      barcodeType: 'qr',
      barcodeContent: 'https://shibuya.tokyuhotels.co.jp/stream-e/reservation/8821',
      notes: 'Direct connection to Shibuya Station. Checkout is 11:00 AM.',
      attachmentId: attachmentId
    },
    // Shared Shinkansen Ticket
    {
      slug: 'pass-tokyo-shinkansen-shared',
      tripSlug: 'trip-tokyo-2026',
      tripId: trip1Id,
      title: 'Shinkansen: Tokyo ➔ Kyoto',
      type: 'train',
      travelerId: 'shared',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      time: '08:03',
      location: 'Tokyo Station (Platform 18)',
      seat: 'Car 5, Seat 12-A & 12-B',
      confirmationCode: 'SHN-77312',
      barcodeType: 'aztec',
      barcodeContent: 'SHINKANSEN-TKT-TOKYO-KYOTO-CAR5-SEAT12AB-SECURE',
      notes: 'Mount Fuji will be visible on the RIGHT side of the train (seats A/B).'
    },
    // DisneySea activity (Graeme)
    {
      slug: 'pass-tokyo-disney-graeme',
      tripSlug: 'trip-tokyo-2026',
      tripId: trip1Id,
      title: 'Tokyo DisneySea Ticket (Graeme)',
      type: 'activity',
      travelerId: 'graeme',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      time: '08:30',
      location: 'Tokyo DisneySea Entrance',
      confirmationCode: 'TDS-GRAEME-9921',
      barcodeType: 'qr',
      barcodeContent: 'DISNEY-SEA-QR-ENTRY-GRAEME-9921827419',
      notes: 'Scan at the turnstiles for entry. Gates open at 8:30 AM.'
    },
    // DisneySea activity (Tony)
    {
      slug: 'pass-tokyo-disney-tony',
      tripSlug: 'trip-tokyo-2026',
      tripId: trip1Id,
      title: 'Tokyo DisneySea Ticket (Tony)',
      type: 'activity',
      travelerId: 'tony',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      time: '08:30',
      location: 'Tokyo DisneySea Entrance',
      confirmationCode: 'TDS-ME-9922',
      barcodeType: 'qr',
      barcodeContent: 'DISNEY-SEA-QR-ENTRY-ME-9922718402',
      notes: 'Scan at the turnstiles for entry. Gates open at 8:30 AM.'
    },
    // Restaurant Reservation (Shared)
    {
      slug: 'pass-tokyo-restaurant-shared',
      tripSlug: 'trip-tokyo-2026',
      tripId: trip1Id,
      title: 'Dinner at Sushi Yoshitake',
      type: 'restaurant',
      travelerId: 'shared',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '19:00',
      location: '7-9-15 Ginza, Chuo-ku, Tokyo (9F)',
      confirmationCode: 'RES-YOSHITAKE-88',
      barcodeType: 'qr',
      barcodeContent: 'https://sushi-yoshitake.com/reserve/RES-YOSHITAKE-88',
      notes: '3 Michelin Star Edomae Sushi. Dress code: Smart Casual. Do not wear strong perfume!'
    }
  ]);

  // 4. Seed Passes for Trip 2 (Rome)
  await db.passes.bulkAdd([
    {
      slug: 'pass-rome-flight-tony',
      tripSlug: 'trip-rome-2026',
      tripId: trip2Id,
      title: 'Flight AZ203: LHR ➔ FCO',
      type: 'flight',
      travelerId: 'tony',
      date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      time: '14:20',
      location: 'London Heathrow (LHR) Terminal 4',
      gate: 'A12',
      seat: '10C',
      confirmationCode: 'AZROM12',
      barcodeType: 'pdf417',
      barcodeContent: 'M1ME/PASSENGER   EAZROM12 LHRFCOAZ 0203 150Y010C0045 147>2180B',
      notes: 'Alitalia flight to Rome Fiumicino.'
    }
  ]);

  console.log('Database seeded successfully.');
}
