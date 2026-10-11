import React, { useMemo } from 'react';
import { type Pass } from '../db';
import { normalizePassType, isBookedPass } from '../passTypes';

export type FilterCategory = 'flights' | 'hotels' | 'restaurants' | 'activities';

export const DEFAULT_TIMELINE_FILTERS: Record<FilterCategory, boolean> = {
  flights: true,
  hotels: true,
  restaurants: true,
  activities: true,
};

export interface TimelineFilterBarProps {
  passes: Pass[];
  activeFilters: Record<FilterCategory, boolean>;
  onToggleFilter: (category: FilterCategory) => void;
}

const FlightFilterIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 shrink-0 transition-transform duration-200"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 1.5 : 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const HotelFilterIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 shrink-0 transition-transform duration-200"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
    <rect x="6" y="10" width="16" height="7" rx="1" fill={filled ? 'currentColor' : 'none'} stroke="none" />
    <rect x="2" y="12" width="4" height="5" fill={filled ? 'currentColor' : 'none'} stroke="none" />
  </svg>
);

const RestaurantFilterIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 shrink-0 transition-transform duration-200"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 shrink-0 transition-transform duration-200"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={filled ? 1.5 : 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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
    <div
      className="grid grid-cols-4 gap-2 w-full max-w-2xl mx-auto"
      role="group"
      aria-label="Filter timeline categories"
    >
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
