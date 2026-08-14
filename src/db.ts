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
  // Retained so existing version 2 backups and databases remain compatible.
  // The app no longer asks for or uses a device-owner profile.
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
