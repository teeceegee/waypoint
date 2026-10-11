/**
 * Local-timezone safe date parsing and formatting utilities for Waypoint.
 * Prevents the standard ES `new Date("YYYY-MM-DD")` UTC-midnight parsing quirk,
 * which otherwise shifts dates backward by one day in negative UTC offsets.
 */

export const parseLocalDate = (dateStr: string, timeStr = '00:00:00'): Date => {
  const cleanDate = (dateStr || '').trim();
  const dateMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(cleanDate);
  if (dateMatch) {
    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;
    const day = Number(dateMatch[3]);

    const cleanTime = (timeStr || '00:00:00').trim();
    const timeMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(cleanTime);
    const hours = timeMatch ? Number(timeMatch[1]) : 0;
    const minutes = timeMatch ? Number(timeMatch[2]) : 0;
    const seconds = timeMatch && timeMatch[3] ? Number(timeMatch[3]) : 0;

    return new Date(year, month, day, hours, minutes, seconds);
  }

  const fallback = new Date(cleanDate.includes('T') ? cleanDate : `${cleanDate}T${timeStr}`);
  return Number.isNaN(fallback.getTime()) ? new Date(cleanDate) : fallback;
};

export const formatShortDate = (dateStr: string): string => {
  try {
    const date = parseLocalDate(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatLongDate = (dateStr: string): string => {
  try {
    const date = parseLocalDate(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateRange = (startStr: string, endStr: string): string => {
  try {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    const startDate = parseLocalDate(startStr);
    const endDate = parseLocalDate(endStr);
    const start = Number.isNaN(startDate.getTime())
      ? startStr
      : startDate.toLocaleDateString('en-US', options);
    const end = Number.isNaN(endDate.getTime())
      ? endStr
      : endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  } catch {
    return `${startStr} - ${endStr}`;
  }
};
