import React, { useEffect, useRef, useMemo, useState } from 'react';
import { type Pass } from '../db';
import { normalizePassType, isBookedPass } from '../passTypes';
import { parseLocalDate } from '../dates';
import { BookedPassCard } from './BookedPassCard';
import { DaySuggestionsAccordion } from './DaySuggestionsAccordion';
import {
  TimelineFilterBar,
  DEFAULT_TIMELINE_FILTERS,
  type FilterCategory,
} from './TimelineFilterBar';

export { TimelineFilterBar, DEFAULT_TIMELINE_FILTERS, type FilterCategory };

interface VerticalTimelineProps {
  passes: Pass[];
  onSelectPass: (pass: Pass) => void;
  activeFilters: Record<FilterCategory, boolean>;
  onResetFilters: () => void;
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

    return futureEntry
      ? futureEntry.key
      : filteredTimelineEntries[filteredTimelineEntries.length - 1]?.key;
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
            const now = new Date().getTime();

            if (entry.kind === 'booked') {
              const isPast = !isNext && entry.timestamp < now;
              return (
                <BookedPassCard
                  key={entry.key}
                  pass={entry.pass}
                  isNext={isNext}
                  isPast={isPast}
                  onSelectPass={onSelectPass}
                  cardRef={(el) => {
                    itemRefs.current[entry.key] = el;
                  }}
                />
              );
            }

            const endOfDayTimestamp = parseLocalDate(entry.date, '23:59:59').getTime();
            const isPastDay = endOfDayTimestamp < now;

            return (
              <DaySuggestionsAccordion
                key={entry.key}
                date={entry.date}
                passes={entry.passes}
                isExpanded={expandedDays.has(entry.date)}
                isPastDay={isPastDay}
                onToggleDay={toggleDay}
                onSelectPass={onSelectPass}
                cardRef={(el) => {
                  itemRefs.current[entry.key] = el;
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
