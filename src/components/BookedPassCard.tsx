import React from 'react';
import { type Pass } from '../db';
import { getPassTypeStubLabel, normalizePassType } from '../passTypes';
import { getTicketStyle } from '../passThemes';
import { formatShortDate } from '../dates';
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
} from 'lucide-react';

interface BookedPassCardProps {
  pass: Pass;
  isNext: boolean;
  isPast: boolean;
  onSelectPass: (pass: Pass) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

const getPassIcon = (type: Pass['type']) => {
  switch (normalizePassType(type)) {
    case 'flight':
      return <Plane className="w-5 h-5" />;
    case 'hotel':
      return <Hotel className="w-5 h-5" />;
    case 'train':
      return <Train className="w-5 h-5" />;
    case 'bus':
      return <Bus className="w-5 h-5" />;
    case 'restaurant':
      return <Utensils className="w-5 h-5" />;
    case 'activity':
      return <Compass className="w-5 h-5" />;
    default:
      return <Ticket className="w-5 h-5" />;
  }
};

export const BookedPassCard: React.FC<BookedPassCardProps> = ({
  pass,
  isNext,
  isPast,
  onSelectPass,
  cardRef,
}) => {
  const style = getTicketStyle(pass.type, isNext, pass.status);

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-300 ${
        isPast ? 'opacity-40 scale-[0.98]' : 'opacity-100'
      }`}
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
        {isPast ? <CheckCircle2 className="w-5 h-5 text-slate-600" /> : getPassIcon(pass.type)}
      </div>

      {/* Main Ticket Stub Card */}
      <div
        onClick={() => onSelectPass(pass)}
        className={`relative rounded-3xl border cursor-pointer flex flex-col transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] overflow-hidden ${style.cardClass}`}
      >
        {/* Perforation punches */}
        <div
          className={`absolute left-0 bottom-[46px] w-4.5 h-4.5 rounded-r-full -translate-x-2.5 z-20 border-r border-t border-b ${style.punchClass}`}
        />
        <div
          className={`absolute right-0 bottom-[46px] w-4.5 h-4.5 rounded-l-full translate-x-2.5 z-20 border-l border-t border-b ${style.punchClass}`}
        />
        <div
          className={`absolute left-4 right-4 bottom-13.5 border-b border-dashed z-20 ${style.dashClass}`}
        />

        {/* Top Details */}
        <div className="p-5 pb-8 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded border ${style.badgeClass}`}
            >
              {formatShortDate(pass.date)} {pass.time ? `@ ${pass.time}` : ''}
            </span>
            {isNext && (
              <span className="animate-pulse bg-violet-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded tracking-wider font-mono shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                NEXT UP
              </span>
            )}
            <span
              className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border ${style.badgeClass}`}
            >
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
                    href={
                      pass.website.startsWith('http') ? pass.website : `https://${pass.website}`
                    }
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
              {getPassIcon(pass.type)}
            </div>
          </div>
        </div>

        {/* Bottom Stub */}
        <div className="px-5 py-3 h-14 flex items-center justify-between z-10 bg-black/10">
          <span
            className={`text-[10px] uppercase font-black tracking-wider font-mono ${style.textMuted}`}
          >
            {getPassTypeStubLabel(pass.type, pass.status)}
          </span>

          <div className="flex items-center gap-4 text-xs font-mono">
            {pass.type === 'flight' && (pass.gate || pass.seat) ? (
              <div className="flex gap-4">
                {pass.gate && (
                  <div className="text-right">
                    <span
                      className={`text-[8px] block uppercase font-sans leading-none mb-0.5 ${style.textMuted}`}
                    >
                      Gate
                    </span>
                    <span className={`${style.textBold} font-bold`}>{pass.gate}</span>
                  </div>
                )}
                {pass.seat && (
                  <div className="text-right">
                    <span
                      className={`text-[8px] block uppercase font-sans leading-none mb-0.5 ${style.textMuted}`}
                    >
                      Seat
                    </span>
                    <span className={`${style.textBold} font-bold`}>{pass.seat}</span>
                  </div>
                )}
              </div>
            ) : pass.confirmationCode ? (
              <div className="text-right">
                <span
                  className={`text-[8px] block uppercase font-sans leading-none mb-0.5 ${style.textMuted}`}
                >
                  Confirm #
                </span>
                <span className={`${style.textBold} font-bold`}>{pass.confirmationCode}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
