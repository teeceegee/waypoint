/**
 * Utility functions for OS-aware Apple Maps and Google Maps deep linking.
 */

export const isApplePlatform = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';

  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS detection

  const isMacOS = /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent) || /Mac/.test(platform);

  return isIOS || isMacOS;
};

export const getMapsServiceName = (): string => {
  return isApplePlatform() ? 'Apple Maps' : 'Google Maps';
};

/**
 * Returns a smart, OS-tailored maps URL.
 * Converts Apple Maps queries to Google Maps on Android/Windows,
 * or generates a default query if only a text location is available.
 */
export const getSmartMapsUrl = (mapsUrl?: string, location?: string): string => {
  const isApple = isApplePlatform();
  const trimmedUrl = mapsUrl?.trim();
  const trimmedLocation = location?.trim();

  if (trimmedUrl) {
    // If running on Android / Windows / Linux, convert apple.com query links to Google Maps
    if (!isApple && (trimmedUrl.includes('maps.apple.com') || trimmedUrl.startsWith('maps:'))) {
      try {
        const urlToParse = trimmedUrl.startsWith('maps:')
          ? trimmedUrl.replace(/^maps:/, 'https://maps.apple.com')
          : trimmedUrl;
        const parsed = new URL(urlToParse);
        const query =
          parsed.searchParams.get('q') ||
          parsed.searchParams.get('address') ||
          parsed.searchParams.get('daddr') ||
          trimmedLocation;

        if (query) {
          return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        }
      } catch {
        // In case of malformed URL, fall back to location search or original
      }
    }

    return trimmedUrl;
  }

  // Fallback: Generate smart map search link based on location string
  if (trimmedLocation) {
    const encoded = encodeURIComponent(trimmedLocation);
    if (isApple) {
      return `https://maps.apple.com/?q=${encoded}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }

  return '';
};
