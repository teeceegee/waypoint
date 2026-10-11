import React from 'react';
import { type Pass } from '../db';
import { normalizePassType } from '../passTypes';
import { formatShortDate } from '../dates';
import { getSmartMapsUrl, getMapsServiceName, getSafeWebsiteUrl } from '../maps';
import {
  Ticket,
  Compass,
  Utensils,
  MapPin,
  Globe,
  ExternalLink,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface DaySuggestionsAccordionProps {
  date: string;
  passes: Pass[];
  isExpanded: boolean;
  isPastDay: boolean;
  onToggleDay: (date: string) => void;
  onSelectPass: (pass: Pass) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

export const DaySuggestionsAccordion: React.FC<DaySuggestionsAccordionProps> = ({
  date,
  passes: daySuggestions,
  isExpanded,
  isPastDay,
  onToggleDay,
  onSelectPass,
  cardRef,
}) => {
  const diningSuggestions = daySuggestions.filter(
    (p) => normalizePassType(p.type) === 'restaurant'
  );
  const activitySuggestions = daySuggestions.filter(
    (p) => normalizePassType(p.type) === 'activity'
  );
  const otherSuggestions = daySuggestions.filter(
    (p) => normalizePassType(p.type) !== 'restaurant' && normalizePassType(p.type) !== 'activity'
  );

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-300 ${
        isPastDay ? 'opacity-50 scale-[0.98]' : 'opacity-100'
      }`}
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
        <div onClick={() => onToggleDay(date)} className="p-5 cursor-pointer select-none group">
          {/* Badges row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded border bg-amber-400/10 text-amber-300 border-amber-400/20">
                {formatShortDate(date)}
              </span>
              <span className="text-[9px] font-extrabold font-mono tracking-wider px-2 py-0.5 rounded border bg-rose-500/15 text-rose-300 border-rose-500/20">
                ✨ {daySuggestions.length} {daySuggestions.length === 1 ? 'IDEA' : 'IDEAS'}
              </span>
              <span className="text-[9px] font-medium text-slate-400 font-mono">
                {diningSuggestions.length > 0 && `${diningSuggestions.length} Dining`}
                {diningSuggestions.length > 0 && activitySuggestions.length > 0 && ' · '}
                {activitySuggestions.length > 0 && `${activitySuggestions.length} Activities`}
                {(diningSuggestions.length > 0 || activitySuggestions.length > 0) &&
                  otherSuggestions.length > 0 &&
                  ' · '}
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

        {/* LEVEL 3: EXPANDABLE ACCORDION BODY (Individual Suggestions) */}
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
                const mapsHref = getSmartMapsUrl(pass.mapsUrl, pass.location);
                const websiteHref = getSafeWebsiteUrl(pass.website);

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
                        <span className="text-xs text-slate-300 font-medium">{pass.location}</span>

                        {mapsHref && (
                          <a
                            href={mapsHref}
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

                        {websiteHref && (
                          <a
                            href={websiteHref}
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
};
