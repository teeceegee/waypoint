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

export const getPassTypeDisplayName = (type: PassType, status?: string): string => {
  const normalized = normalizePassType(type);
  switch (normalized) {
    case 'flight':
      return 'Flight Boarding Pass';
    case 'hotel':
      return status === 'recommended' ? 'Recommended Hotel' : 'Accommodation Reservation';
    case 'train':
      return 'Train Ticket';
    case 'bus':
      return 'Bus / Transit Ticket';
    case 'restaurant':
      return status === 'recommended' ? 'Dining Recommendation' : 'Restaurant Reservation';
    case 'activity':
      return status === 'recommended' ? 'Recommended Activity' : 'Activity Pass';
    default:
      return 'Travel Document';
  }
};

export const getPassTypeStubLabel = (type: PassType, status?: string): string => {
  const normalized = normalizePassType(type);
  switch (normalized) {
    case 'flight':
      return '✈️ Boarding Pass';
    case 'hotel':
      return status === 'recommended' ? '🏨 Hotel Idea' : '🏨 Hotel Guest Pass';
    case 'restaurant':
      return status === 'recommended' ? '🍴 Dining Recommendation' : '🍽️ Dining Reservation';
    case 'train':
      return '🚄 Railway Ticket';
    case 'bus':
      return '🚌 Transit Ticket';
    case 'activity':
      return status === 'recommended' ? '🎡 Activity Idea' : '🎟️ Activity Pass';
    default:
      return '📁 Travel Document';
  }
};

export interface PassLike {
  type: unknown;
  status?: string;
  confirmationCode?: string;
  barcodeType?: string;
}

/**
 * Determines whether a pass represents a confirmed/booked item (Level 2)
 * or a flexible suggestion/recommendation (Level 3 day accordion).
 */
export const isBookedPass = (pass: PassLike): boolean => {
  const normType = normalizePassType(pass.type);

  // Transportation and lodging are booked by default unless explicitly marked as a suggestion
  if (normType === 'flight' || normType === 'hotel' || normType === 'train' || normType === 'bus') {
    return pass.status !== 'recommended' && pass.status !== 'optional';
  }

  // Restaurant: booked if confirmed or has a booking reference
  if (normType === 'restaurant') {
    if (pass.status === 'confirmed') return true;
    if (pass.confirmationCode && pass.confirmationCode.trim().length > 0) return true;
    return false;
  }

  // Activity: booked if confirmed, has a booking code, or has an active barcode ticket
  if (normType === 'activity') {
    if (pass.status === 'confirmed') return true;
    if (pass.confirmationCode && pass.confirmationCode.trim().length > 0) return true;
    if (pass.barcodeType && pass.barcodeType !== 'none') return true;
    return false;
  }

  // Other travel documents
  if (pass.status === 'recommended' || pass.status === 'optional') {
    return false;
  }
  return true;
};

