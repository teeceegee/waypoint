export const SHARED_TRAVELER_ID = 'shared';
export const MAX_TRAVELERS = 12;

interface TravelerTaggedRecord {
  travelerId?: unknown;
}

export const normalizeTravelerId = (value: unknown): string => {
  if (typeof value !== 'string') return SHARED_TRAVELER_ID;

  const normalized = value.trim().toLowerCase();
  return normalized || SHARED_TRAVELER_ID;
};

export const getTravelerIds = (...recordSets: TravelerTaggedRecord[][]): string[] => {
  const travelerIds = new Set<string>();

  for (const records of recordSets) {
    for (const record of records) {
      const travelerId = normalizeTravelerId(record.travelerId);
      if (travelerId !== SHARED_TRAVELER_ID) travelerIds.add(travelerId);
    }
  }

  return [...travelerIds].sort((left, right) => left.localeCompare(right));
};

export const assertTravelerLimit = (travelerIds: string[]): void => {
  if (travelerIds.length > MAX_TRAVELERS) {
    throw new Error(
      `Waypoint supports up to ${MAX_TRAVELERS} travellers, but ${travelerIds.length} distinct passenger IDs were found.`
    );
  }
};

export const formatTravelerId = (travelerId: string): string => {
  return travelerId
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());
};
