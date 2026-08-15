export type PassType =
  | 'flight'
  | 'train'
  | 'bus'
  | 'hotel'
  | 'restaurant'
  | 'activity'
  | 'other';

export const normalizePassType = (value: unknown): PassType => {
  if (typeof value !== 'string') return 'other';

  const clean = value.trim().toLowerCase();

  switch (clean) {
    case 'flight':
    case 'flights':
    case 'plane':
    case 'airline':
    case 'boarding_pass':
    case 'boarding-pass':
      return 'flight';

    case 'train':
    case 'trains':
    case 'rail':
    case 'railway':
    case 'railways':
    case 'eurostar':
    case 'amtrak':
    case 'shinkansen':
      return 'train';

    case 'bus':
    case 'buses':
    case 'coach':
    case 'coaches':
    case 'transit':
    case 'shuttle':
      return 'bus';

    case 'hotel':
    case 'hotels':
    case 'lodging':
    case 'accommodation':
    case 'accommodations':
    case 'resort':
    case 'stay':
    case 'airbnb':
    case 'hostel':
      return 'hotel';

    case 'restaurant':
    case 'restaurants':
    case 'dining':
    case 'dinner':
    case 'lunch':
    case 'breakfast':
    case 'reservation':
    case 'reservations':
    case 'meal':
    case 'food':
      return 'restaurant';

    case 'activity':
    case 'activities':
    case 'event':
    case 'events':
    case 'attraction':
    case 'attractions':
    case 'tour':
    case 'tours':
    case 'experience':
    case 'experiences':
    case 'sightseeing':
    case 'ticket':
    case 'tickets':
      return 'activity';

    case 'other':
    case 'document':
    case 'documents':
      return 'other';

    default:
      return 'other';
  }
};

export const getPassTypeDisplayName = (type: PassType): string => {
  const normalized = normalizePassType(type);
  switch (normalized) {
    case 'flight':
      return 'Flight Boarding Pass';
    case 'hotel':
      return 'Accommodation Reservation';
    case 'train':
      return 'Train Ticket';
    case 'bus':
      return 'Bus / Transit Ticket';
    case 'restaurant':
      return 'Restaurant Reservation';
    case 'activity':
      return 'Activity Pass';
    default:
      return 'Travel Document';
  }
};

export const getPassTypeStubLabel = (type: PassType): string => {
  const normalized = normalizePassType(type);
  switch (normalized) {
    case 'flight':
      return '✈️ Boarding Pass';
    case 'hotel':
      return '🏨 Hotel Guest Pass';
    case 'restaurant':
      return '🍽️ Dining Reservation';
    case 'train':
      return '🚄 Railway Ticket';
    case 'bus':
      return '🚌 Transit Ticket';
    case 'activity':
      return '🎟️ Activity Pass';
    default:
      return '📁 Travel Document';
  }
};
