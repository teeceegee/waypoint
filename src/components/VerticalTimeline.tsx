import React, { useEffect, useRef, useMemo, useState } from 'react';
import { type Pass } from '../db';
import { getPassTypeStubLabel, normalizePassType, isBookedPass } from '../passTypes';
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

interface VerticalTimelineProps {
  passes: Pass[];
  onSelectPass: (pass: Pass) => void;
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

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ passes, onSelectPass }) => {
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set());

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
        const timestamp = new Date(`${pass.date}T${pass.time || '00:00'}`).getTime();
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
      const timestamp = new Date(`${date}T${earliestTime}`).getTime();

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

  // 2. Identify the "Next Required Item" (first future/ongoing event)
  const nextRequiredKey = useMemo(() => {
    if (timelineEntries.length === 0) return null;
    const now = new Date().getTime();

    const futureEntry = timelineEntries.find((entry) => {
      if (entry.kind === 'booked') {
        const duration = entry.pass.type === 'hotel' ? 86400000 : 10800000; // 24h for hotel, 3h for others
        return entry.timestamp + duration >= now;
      } else {
        // Suggestion day card: valid until the end of that day (23:59:59)
        const endOfDay = new Date(`${entry.date}T23:59:59`).getTime();
        return endOfDay >= now;
      }
    });

    return futureEntry ? futureEntry.key : timelineEntries[timelineEntries.length - 1]?.key;
  }, [timelineEntries]);

  // 3. Scroll to the "Next Required Item" when the timeline is mounted
  useEffect(() => {
    if (nextRequiredKey) {
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

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-8 my-4">
      {timelineEntries.map((entry) => {
        const isNext = entry.key === nextRequiredKey;

        // ==========================================
        // 1. BOOKED PASS CARD (Level 2 Direct Item)
        // ==========================================
        if (entry.kind === 'booked') {
          const pass = entry.pass;
          const style = getTicketStyle(pass.type, isNext, pass.status);
          const isPast = !isNext && new Date(`${pass.date}T${pass.time || '00:00'}`).getTime() < new Date().getTime();

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

        const endOfDayTimestamp = new Date(`${entry.date}T23:59:59`).getTime();
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
  );
};
