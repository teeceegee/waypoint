import React, { useEffect, useRef, useMemo, useState } from 'react';
import { type Pass } from '../db';
import { getPassTypeStubLabel, normalizePassType, isBookedPass } from '../passTypes';
import { parseLocalDate, formatShortDate } from '../dates';
import { getSmartMapsUrl, getMapsServiceName } from '../maps';
import {
  Plane,
  Hotel,
  Train,
  Ticket,
  Compass,
  CheckCircle2,
  Utensils,
  Bus,
  MapPin,
  Globe,
  ExternalLink,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export type FilterCategory = 'flights' | 'hotels' | 'restaurants' | 'activities';

export const DEFAULT_TIMELINE_FILTERS: Record<FilterCategory, boolean> = {
  flights: true,
  hotels: true,
  restaurants: true,
  activities: true,
};

interface VerticalTimelineProps {
  passes: Pass[];
  onSelectPass: (pass: Pass) => void;
  activeFilters: Record<FilterCategory, boolean>;
  onResetFilters: () => void;
}

interface TimelineFilterBarProps {
  passes: Pass[];
  activeFilters: Record<FilterCategory, boolean>;
  onToggleFilter: (category: FilterCategory) => void;
}

type TimelineEntry =
  | {
      kind: 'booked';
      key: string;
      pass: Pass;
      timestamp: number;
    }
  | {
      kind: 'day_suggestions';
      key: string;
      date: string;
      passes: Pass[];
      timestamp: number;
    };

const FlightFilterIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 transition-transform duration-200" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 1.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const HotelFilterIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
    <rect x="6" y="10" width="16" height="7" rx="1" fill={filled ? 'currentColor' : 'none'} stroke="none" />
    <rect x="2" y="12" width="4" height="5" fill={filled ? 'currentColor' : 'none'} stroke="none" />
  </svg>
);

const RestaurantFilterIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {filled ? (
      <>
        <path d="M3 2v7c0 1.7 1.3 3 3 3h1v10h2V12h1c1.7 0 3-1.3 3-3V2H3z" fill="currentColor" stroke="none" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" fill="currentColor" />
      </>
    ) : (
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </>
    )}
  </svg>
);

const ActivitiesFilterIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 transition-transform duration-200" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 1.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

export const TimelineFilterBar: React.FC<TimelineFilterBarProps> = ({
  passes,
  activeFilters,
  onToggleFilter,
}) => {
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      flights: 0,
      hotels: 0,
      restaurants: 0,
      activities: 0,
    };
    for (const pass of passes) {
      if (isBookedPass(pass)) {
        const normType = normalizePassType(pass.type);
        if (normType === 'flight' || normType === 'train' || normType === 'bus') {
          counts.flights++;
        } else if (normType === 'hotel') {
          counts.hotels++;
        } else if (normType === 'restaurant') {
          counts.restaurants++;
        } else {
          counts.activities++;
        }
      } else {
        counts.activities++;
      }
    }
    return counts;
  }, [passes]);

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-2xl mx-auto" role="group" aria-label="Filter timeline categories">
      {/* 1. Flights Toggle */}
      <button
        type="button"
        onClick={() => onToggleFilter('flights')}
        aria-pressed={activeFilters.flights}
        aria-label="Toggle Flights"
        title="Flights & Transit"
        className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          activeFilters.flights
            ? 'bg-gradient-to-r from-blue-700 via-sky-800 to-indigo-900 border-sky-400/50 text-white shadow-sm shadow-sky-950/50'
            : 'bg-slate-950/50 border-sky-500/35 text-sky-400/70 hover:border-sky-400/60 hover:text-sky-300'
        }`}
      >
        <FlightFilterIcon filled={activeFilters.flights} />
        <span
          className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md font-extrabold leading-none ${
            activeFilters.flights ? 'bg-white/15 text-sky-100' : 'bg-sky-500/10 text-sky-400/70'
          }`}
        >
          {categoryCounts.flights}
        </span>
      </button>

      {/* 2. Hotels Toggle */}
      <button
        type="button"
        onClick={() => onToggleFilter('hotels')}
        aria-pressed={activeFilters.hotels}
        aria-label="Toggle Hotels"
        title="Hotels & Stays"
        className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          activeFilters.hotels
            ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 border-emerald-400/50 text-white shadow-sm shadow-emerald-950/50'
            : 'bg-slate-950/50 border-emerald-500/35 text-emerald-400/70 hover:border-emerald-400/60 hover:text-emerald-300'
        }`}
      >
        <HotelFilterIcon filled={activeFilters.hotels} />
        <span
          className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md font-extrabold leading-none ${
            activeFilters.hotels ? 'bg-white/15 text-emerald-100' : 'bg-emerald-500/10 text-emerald-400/70'
          }`}
        >
          {categoryCounts.hotels}
        </span>
      </button>

      {/* 3. Restaurant Bookings Toggle */}
      <button
        type="button"
        onClick={() => onToggleFilter('restaurants')}
        aria-pressed={activeFilters.restaurants}
        aria-label="Toggle Restaurant Bookings"
        title="Restaurant Bookings"
        className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          activeFilters.restaurants
            ? 'bg-gradient-to-r from-rose-800 via-rose-900 to-red-950 border-rose-400/50 text-rose-100 shadow-sm shadow-rose-950/50'
            : 'bg-slate-950/50 border-rose-500/35 text-rose-400/70 hover:border-rose-400/60 hover:text-rose-300'
        }`}
      >
        <RestaurantFilterIcon filled={activeFilters.restaurants} />
        <span
          className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md font-extrabold leading-none ${
            activeFilters.restaurants ? 'bg-rose-500/25 text-rose-200' : 'bg-rose-500/10 text-rose-400/70'
          }`}
        >
          {categoryCounts.restaurants}
        </span>
      </button>

      {/* 4. Activities / Suggestions Toggle */}
      <button
        type="button"
        onClick={() => onToggleFilter('activities')}
        aria-pressed={activeFilters.activities}
        aria-label="Toggle Activities & Suggestions"
        title="Activities & Daily Suggestions"
        className={`flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
          activeFilters.activities
            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 border-amber-300/60 text-slate-950 shadow-sm shadow-amber-950/40'
            : 'bg-slate-950/50 border-amber-500/35 text-amber-400/70 hover:border-amber-400/60 hover:text-amber-300'
        }`}
      >
        <ActivitiesFilterIcon filled={activeFilters.activities} />
        <span
          className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md font-extrabold leading-none ${
            activeFilters.activities ? 'bg-black/15 text-slate-950' : 'bg-amber-500/10 text-amber-400/70'
          }`}
        >
          {categoryCounts.activities}
        </span>
      </button>
    </div>
  );
};

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  passes,
  onSelectPass,
  activeFilters,
  onResetFilters,
}) => {
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hasAutoScrolledRef = useRef(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set());
  const tripContextKey = passes[0]?.tripId ?? passes[0]?.tripSlug ?? null;

  useEffect(() => {
    hasAutoScrolledRef.current = false;
    setExpandedDays(new Set());
  }, [tripContextKey]);

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  // 1. Separate passes into Booked (Level 2) and Suggestions (Level 3)
  const timelineEntries = useMemo(() => {
    const bookedEntries: TimelineEntry[] = [];
    const suggestionsByDate = new Map<string, Pass[]>();

    for (const pass of passes) {
      if (isBookedPass(pass)) {
        const timestamp = parseLocalDate(pass.date, pass.time || '00:00').getTime();
        bookedEntries.push({
          kind: 'booked',
          key: `pass-${pass.id || pass.slug}`,
          pass,
          timestamp,
        });
      } else {
        const list = suggestionsByDate.get(pass.date) || [];
        list.push(pass);
        suggestionsByDate.set(pass.date, list);
      }
    }

    const suggestionEntries: TimelineEntry[] = [];
    for (const [date, dayPasses] of suggestionsByDate.entries()) {
      // Sort suggestions within the day chronologically
      dayPasses.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

      // Position the day summary card at the earliest suggestion time, or midday (12:00) if none
      const earliestTime = dayPasses.find((p) => p.time)?.time || '12:00';
      const timestamp = parseLocalDate(date, earliestTime).getTime();

      suggestionEntries.push({
        kind: 'day_suggestions',
        key: `day-${date}`,
        date,
        passes: dayPasses,
        timestamp,
      });
    }

    // Combine and sort all timeline entries chronologically
    return [...bookedEntries, ...suggestionEntries].sort((a, b) => a.timestamp - b.timestamp);
  }, [passes]);

  // Apply category toggle filters
  const filteredTimelineEntries = useMemo(() => {
    return timelineEntries.filter((entry) => {
      if (entry.kind === 'day_suggestions') {
        return activeFilters.activities;
      }
      const normType = normalizePassType(entry.pass.type);
      if (normType === 'flight' || normType === 'train' || normType === 'bus') {
        return activeFilters.flights;
      }
      if (normType === 'hotel') {
        return activeFilters.hotels;
      }
      if (normType === 'restaurant') {
        return activeFilters.restaurants;
      }
      return activeFilters.activities;
    });
  }, [timelineEntries, activeFilters]);

  // 2. Identify the "Next Required Item" (first future/ongoing event)
  const nextRequiredKey = useMemo(() => {
    if (filteredTimelineEntries.length === 0) return null;
    const now = new Date().getTime();

    const futureEntry = filteredTimelineEntries.find((entry) => {
      if (entry.kind === 'booked') {
        const duration = entry.pass.type === 'hotel' ? 86400000 : 10800000; // 24h for hotel, 3h for others
        return entry.timestamp + duration >= now;
      } else {
        // Suggestion day card: valid until the end of that day (23:59:59)
        const endOfDay = parseLocalDate(entry.date, '23:59:59').getTime();
        return endOfDay >= now;
      }
    });

    return futureEntry ? futureEntry.key : filteredTimelineEntries[filteredTimelineEntries.length - 1]?.key;
  }, [filteredTimelineEntries]);

  // 3. Scroll to the "Next Required Item" once when the timeline is mounted
  useEffect(() => {
    if (nextRequiredKey && !hasAutoScrolledRef.current) {
      hasAutoScrolledRef.current = true;
      const timer = setTimeout(() => {
        const targetElement = itemRefs.current[nextRequiredKey];
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nextRequiredKey]);

  const getIcon = (type: Pass['type']) => {
    switch (normalizePassType(type)) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'restaurant': return <Utensils className="w-5 h-5" />;
      case 'activity': return <Compass className="w-5 h-5" />;
      default: return <Ticket className="w-5 h-5" />;
    }
  };

  const getTicketStyle = (type: Pass['type'], isNext: boolean, status?: string) => {
    const nextRing = isNext ? 'ring-3 ring-violet-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_25px_rgba(139,92,246,0.5)] z-10' : '';

    switch (normalizePassType(type)) {
      case 'flight':
        if (status === 'recommended' || status === 'planned') {
          return {
            cardClass: `bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 border-sky-300/40 text-white shadow-lg ${nextRing}`,
            punchClass: 'bg-slate-950 border-sky-400/30',
            dashClass: 'border-sky-200/40',
            badgeClass: 'bg-white/20 text-sky-100 border-white/20 font-bold',
            textMuted: 'text-sky-100 font-medium',
            textBold: 'text-white font-extrabold',
            iconBg: 'bg-white/20 text-white border-white/20'
          };
        }
        return {
          cardClass: `bg-gradient-to-r from-blue-700 via-sky-850 to-indigo-900 border-sky-500/30 text-white ${nextRing}`,
          punchClass: 'bg-slate-950 border-sky-500/20',
          dashClass: 'border-sky-300/30',
          badgeClass: 'bg-white/10 text-sky-200 border-white/10',
          textMuted: 'text-sky-200',
          textBold: 'text-white',
          iconBg: 'bg-white/10 text-white border-white/15'
        };
      case 'train':
      case 'bus':
        return {
          cardClass: `bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 border-amber-400/30 text-slate-950 ${nextRing}`,
          punchClass: 'bg-slate-950 border-amber-600/30',
          dashClass: 'border-amber-900/20',
          badgeClass: 'bg-black/10 text-slate-900 border-black/10 font-bold',
          textMuted: 'text-slate-800 font-semibold',
          textBold: 'text-slate-950 font-black',
          iconBg: 'bg-black/10 text-slate-950 border-black/10'
        };
      case 'hotel':
        return {
          cardClass: `bg-gradient-to-r from-emerald-600 via-emerald-750 to-teal-850 border-emerald-500/20 text-white ${nextRing}`,
          punchClass: 'bg-slate-950 border-emerald-500/20',
          dashClass: 'border-emerald-300/30',
          badgeClass: 'bg-white/10 text-emerald-100 border-white/10',
          textMuted: 'text-emerald-100',
          textBold: 'text-white',
          iconBg: 'bg-white/10 text-white border-white/15'
        };
      case 'restaurant':
        if (status === 'recommended') {
          return {
            cardClass: `bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700 border-rose-300/30 text-white shadow-xl ${nextRing}`,
            punchClass: 'bg-slate-950 border-rose-400/30',
            dashClass: 'border-rose-200/30',
            badgeClass: 'bg-white/15 text-rose-100 border-white/15 font-bold',
            textMuted: 'text-rose-100/90 font-medium',
            textBold: 'text-white font-extrabold',
            iconBg: 'bg-white/15 text-white border-white/15'
          };
        }
        return {
          cardClass: `bg-gradient-to-r from-rose-900 via-rose-950 to-red-950 border-rose-500/20 text-slate-100 ${nextRing}`,
          punchClass: 'bg-slate-950 border-rose-500/10',
          dashClass: 'border-rose-400/20',
          badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
          textMuted: 'text-rose-300/80',
          textBold: 'text-slate-100',
          iconBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
        };
      case 'activity':
        return {
          cardClass: `bg-gradient-to-br from-white via-slate-50 to-slate-100 border-white/80 text-slate-950 shadow-2xl ${nextRing}`,
          punchClass: 'bg-slate-950 border-slate-300/80',
          dashClass: 'border-slate-300/80',
          badgeClass: 'bg-black/10 text-slate-900 border-black/10 font-bold',
          textMuted: 'text-slate-600 font-semibold',
          textBold: 'text-slate-950 font-black',
          iconBg: 'bg-black/10 text-slate-950 border-black/10'
        };
      default:
        return {
          cardClass: `bg-gradient-to-r from-slate-800 to-slate-900 border-white/10 text-slate-100 ${nextRing}`,
          punchClass: 'bg-slate-950 border-white/10',
          dashClass: 'border-white/10',
          badgeClass: 'bg-slate-700 text-slate-200 border-white/5',
          textMuted: 'text-slate-400',
          textBold: 'text-slate-100',
          iconBg: 'bg-slate-700 text-slate-200 border-white/5'
        };
    }
  };

  const formatDate = formatShortDate;

  return (
    <div className="space-y-6">
      {filteredTimelineEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed border-white/10 rounded-3xl bg-slate-950/30 text-center">
          <p className="text-xs font-semibold text-slate-400">
            No timeline items match the selected category filters.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-xs font-bold transition cursor-pointer"
          >
            Show All Categories
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-8 my-4">
          {filteredTimelineEntries.map((entry) => {
        const isNext = entry.key === nextRequiredKey;

        // ==========================================
        // 1. BOOKED PASS CARD (Level 2 Direct Item)
        // ==========================================
        if (entry.kind === 'booked') {
          const pass = entry.pass;
          const style = getTicketStyle(pass.type, isNext, pass.status);
          const isPast = !isNext && entry.timestamp < new Date().getTime();

          return (
            <div
              key={entry.key}
              ref={(el) => {
                itemRefs.current[entry.key] = el;
              }}
              className={`relative transition-all duration-300 ${isPast ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
            >
              {/* Timeline Node Icon (on left line rail) */}
              <div
                className={`absolute -left-[37px] sm:-left-[45px] top-1.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 z-10 ${
                  isPast
                    ? 'bg-slate-950 border-white/10 text-slate-600'
                    : isNext
                    ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                    : 'bg-slate-900 border-white/20 text-slate-300'
                }`}
              >
                {isPast ? <CheckCircle2 className="w-5 h-5 text-slate-600" /> : getIcon(pass.type)}
              </div>

              {/* Main Ticket Stub Card */}
              <div
                onClick={() => onSelectPass(pass)}
                className={`relative rounded-3xl border cursor-pointer flex flex-col transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] overflow-hidden ${style.cardClass}`}
              >
                {/* Perforation punches */}
                <div className={`absolute left-0 bottom-[46px] w-4.5 h-4.5 rounded-r-full -translate-x-2.5 z-20 border-r border-t border-b ${style.punchClass}`} />
                <div className={`absolute right-0 bottom-[46px] w-4.5 h-4.5 rounded-l-full translate-x-2.5 z-20 border-l border-t border-b ${style.punchClass}`} />
                <div className={`absolute left-4 right-4 bottom-13.5 border-b border-dashed z-20 ${style.dashClass}`} />

                {/* Top Details */}
                <div className="p-5 pb-8 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded border ${style.badgeClass}`}>
                      {formatDate(pass.date)} {pass.time ? `@ ${pass.time}` : ''}
                    </span>
                    {isNext && (
                      <span className="animate-pulse bg-violet-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded tracking-wider font-mono shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                        NEXT UP
                      </span>
                    )}
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border ${style.badgeClass}`}>
                      {!pass.travelerId || pass.travelerId === 'shared' ? 'shared' : pass.travelerId}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className={`text-base sm:text-lg font-bold leading-tight ${style.textBold}`}>
                        {pass.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <p className={`text-xs font-medium ${style.textMuted}`}>{pass.location}</p>
                        {getSmartMapsUrl(pass.mapsUrl, pass.location) && (
                          <a
                            href={getSmartMapsUrl(pass.mapsUrl, pass.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition ${style.badgeClass} hover:opacity-100 opacity-85`}
                            title={`Open in ${getMapsServiceName()}`}
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Map</span>
                          </a>
                        )}
                        {pass.website && (
                          <a
                            href={pass.website.startsWith('http') ? pass.website : `https://${pass.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition ${style.badgeClass} hover:opacity-100 opacity-85`}
                            title="Visit Website"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            <span>Website</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-2xl border hidden sm:block ${style.iconBg}`}>
                      {getIcon(pass.type)}
                    </div>
                  </div>
                </div>

                {/* Bottom Stub */}
                <div className="px-5 py-3 h-14 flex items-center justify-between z-10 bg-black/10">
                  <span className={`text-[10px] uppercase font-black tracking-wider font-mono ${style.textMuted}`}>
                    {getPassTypeStubLabel(pass.type, pass.status)}
                  </span>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    {pass.type === 'flight' && (pass.gate || pass.seat) ? (
                      <div className="flex gap-4">
                        {pass.gate && (
                          <div className="text-right">
                            <span className={`text-[8px] block uppercase font-sans leading-none mb-0.5 ${style.textMuted}`}>Gate</span>
                            <span className={`${style.textBold} font-bold`}>{pass.gate}</span>
                          </div>
                        )}
                        {pass.seat && (
                          <div className="text-right">
                            <span className={`text-[8px] block uppercase font-sans leading-none mb-0.5 ${style.textMuted}`}>Seat</span>
                            <span className={`${style.textBold} font-bold`}>{pass.seat}</span>
                          </div>
                        )}
                      </div>
                    ) : pass.confirmationCode ? (
                      <div className="text-right">
                        <span className={`text-[8px] block uppercase font-sans leading-none mb-0.5 ${style.textMuted}`}>Confirm #</span>
                        <span className={`${style.textBold} font-bold`}>{pass.confirmationCode}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // ==============================================================
        // 2. DAY SUGGESTIONS ACCORDION CARD (Level 2 Card -> Level 3 Drill-Down)
        // ==============================================================
        const isExpanded = expandedDays.has(entry.date);
        const daySuggestions = entry.passes;
        const diningSuggestions = daySuggestions.filter((p) => normalizePassType(p.type) === 'restaurant');
        const activitySuggestions = daySuggestions.filter((p) => normalizePassType(p.type) === 'activity');
        const otherSuggestions = daySuggestions.filter(
          (p) => normalizePassType(p.type) !== 'restaurant' && normalizePassType(p.type) !== 'activity'
        );

        const endOfDayTimestamp = parseLocalDate(entry.date, '23:59:59').getTime();
        const isPastDay = endOfDayTimestamp < new Date().getTime();

        return (
          <div
            key={entry.key}
            ref={(el) => {
              itemRefs.current[entry.key] = el;
            }}
            className={`relative transition-all duration-300 ${isPastDay ? 'opacity-50 scale-[0.98]' : 'opacity-100'}`}
          >
            {/* Timeline Node Icon: Sparkles & Activity Star */}
            <div
              className={`absolute -left-[37px] sm:-left-[45px] top-3 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 z-10 ${
                isPastDay
                  ? 'bg-slate-950 border-white/10 text-slate-600'
                  : 'bg-gradient-to-br from-amber-500/25 to-rose-500/25 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>

            {/* Accordion Container Card */}
            <div
              className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-amber-500/40 shadow-2xl ring-1 ring-amber-500/30'
                  : 'bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950 border-amber-500/20 hover:border-amber-400/40 shadow-xl'
              }`}
            >
              {/* Clickable Header for Toggling Accordion */}
              <div
                onClick={() => toggleDay(entry.date)}
                className="p-5 cursor-pointer select-none group"
              >
                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded border bg-amber-400/10 text-amber-300 border-amber-400/20">
                      {formatDate(entry.date)}
                    </span>
                    <span className="text-[9px] font-extrabold font-mono tracking-wider px-2 py-0.5 rounded border bg-rose-500/15 text-rose-300 border-rose-500/20">
                      ✨ {daySuggestions.length} {daySuggestions.length === 1 ? 'IDEA' : 'IDEAS'}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 font-mono">
                      {diningSuggestions.length > 0 && `${diningSuggestions.length} Dining`}
                      {diningSuggestions.length > 0 && activitySuggestions.length > 0 && ' · '}
                      {activitySuggestions.length > 0 && `${activitySuggestions.length} Activities`}
                      {(diningSuggestions.length > 0 || activitySuggestions.length > 0) && otherSuggestions.length > 0 && ' · '}
                      {otherSuggestions.length > 0 && `${otherSuggestions.length} Other`}
                    </span>
                  </div>

                  {/* Expand / Collapse Indicator */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold font-mono text-amber-400 group-hover:text-amber-300 transition-colors">
                    <span className="text-[10px] hidden sm:inline uppercase tracking-wider">
                      {isExpanded ? 'Collapse' : 'Explore Ideas'}
                    </span>
                    <div
                      className={`p-1 rounded-full bg-white/5 border border-white/10 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 bg-amber-400/20 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-200 transition-colors flex items-center gap-2">
                      <span>Daily Eating & Activity Ideas</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isExpanded
                        ? 'Tap any card below for details, menus, directions, or documents.'
                        : 'Flexible dining recommendations, activity ideas, and local drop-ins.'}
                    </p>
                  </div>
                </div>

                {/* Collapsed Preview Chips (Pills of items inside) */}
                {!isExpanded && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                    {daySuggestions.slice(0, 4).map((pass) => (
                      <span
                        key={pass.id || pass.slug}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-white/5"
                      >
                        {normalizePassType(pass.type) === 'restaurant' ? (
                          <Utensils className="w-2.5 h-2.5 text-rose-400" />
                        ) : (
                          <Compass className="w-2.5 h-2.5 text-sky-400" />
                        )}
                        <span className="truncate max-w-[150px]">{pass.title}</span>
                      </span>
                    ))}
                    {daySuggestions.length > 4 && (
                      <span className="text-[10px] font-mono text-slate-500 self-center">
                        +{daySuggestions.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ========================================================
                  LEVEL 3: EXPANDABLE ACCORDION BODY (Individual Suggestions)
                 ======================================================== */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/10 space-y-3 bg-black/20">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 flex items-center justify-between pt-1">
                    <span>Suggestions for this day ({daySuggestions.length})</span>
                    <span className="text-slate-500">Tap to open full pass details</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {daySuggestions.map((pass) => {
                      const isDining = normalizePassType(pass.type) === 'restaurant';
                      const isActivity = normalizePassType(pass.type) === 'activity';

                      return (
                        <div
                          key={pass.id || pass.slug}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPass(pass);
                          }}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] flex flex-col gap-2 ${
                            isDining
                              ? 'bg-gradient-to-r from-rose-950/40 via-rose-900/30 to-amber-950/30 border-rose-500/25 hover:border-rose-400/50 text-rose-50'
                              : isActivity
                              ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900/40 to-sky-950/40 border-sky-500/25 hover:border-sky-400/50 text-sky-50'
                              : 'bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-200'
                          }`}
                        >
                          {/* Suggestion item header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                                  isDining
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    : isActivity
                                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                    : 'bg-slate-800 text-slate-300 border-white/10'
                                }`}
                              >
                                {isDining ? (
                                  <>
                                    <Utensils className="w-2.5 h-2.5" />
                                    Dining Recommendation
                                  </>
                                ) : isActivity ? (
                                  <>
                                    <Compass className="w-2.5 h-2.5" />
                                    Activity Idea
                                  </>
                                ) : (
                                  <>
                                    <Ticket className="w-2.5 h-2.5" />
                                    Suggestion
                                  </>
                                )}
                              </span>

                              {pass.time && (
                                <span className="text-[10px] font-mono font-semibold text-slate-300">
                                  @{pass.time}
                                </span>
                              )}
                            </div>

                            <span className="text-[9px] uppercase font-mono tracking-wider opacity-60">
                              Drop-in / No Booking
                            </span>
                          </div>

                          {/* Title and location */}
                          <div>
                            <h5 className="text-sm sm:text-base font-bold text-white leading-snug">
                              {pass.title}
                            </h5>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              <span className="text-xs text-slate-300 font-medium">
                                {pass.location}
                              </span>

                              {getSmartMapsUrl(pass.mapsUrl, pass.location) && (
                                <a
                                  href={getSmartMapsUrl(pass.mapsUrl, pass.location)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border bg-white/10 border-white/10 text-white hover:bg-white/20 transition"
                                  title={`Open in ${getMapsServiceName()}`}
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>Map</span>
                                </a>
                              )}

                              {pass.website && (
                                <a
                                  href={pass.website.startsWith('http') ? pass.website : `https://${pass.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border bg-white/10 border-white/10 text-white hover:bg-white/20 transition"
                                  title="Visit Website"
                                >
                                  <Globe className="w-2.5 h-2.5" />
                                  <span>Website</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Notes snippet if present */}
                          {pass.notes && (
                            <p className="text-xs text-slate-400 italic line-clamp-2 mt-0.5">
                              {pass.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
};
