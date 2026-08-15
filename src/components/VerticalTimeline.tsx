import React, { useEffect, useRef, useMemo } from 'react';
import { type Pass } from '../db';
import { getPassTypeStubLabel, normalizePassType } from '../passTypes';
import { Plane, Hotel, Train, Ticket, Compass, CheckCircle2, Utensils, Bus } from 'lucide-react';

interface VerticalTimelineProps {
  passes: Pass[];
  onSelectPass: (pass: Pass) => void;
}

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ passes, onSelectPass }) => {
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // 1. Sort passes chronologically by Date and Time
  const sortedPasses = useMemo(() => {
    return [...passes].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [passes]);

  // 2. Identify the "Next Required Item" (first future/ongoing event)
  const nextRequiredId = useMemo(() => {
    if (sortedPasses.length === 0) return null;
    const now = new Date().getTime();

    const futurePass = sortedPasses.find(pass => {
      const passTime = new Date(`${pass.date}T${pass.time || '00:00'}`).getTime();
      const duration = pass.type === 'hotel' ? 86400000 : 10800000; // 24h for hotel, 3h for others
      return (passTime + duration) >= now;
    });

    return futurePass ? futurePass.id : sortedPasses[sortedPasses.length - 1]?.id;
  }, [sortedPasses]);

  // 3. Scroll to the "Next Required Item" when the timeline is mounted
  useEffect(() => {
    if (nextRequiredId !== undefined && nextRequiredId !== null) {
      const timer = setTimeout(() => {
        const targetElement = itemRefs.current[nextRequiredId];
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nextRequiredId]);

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

  const getTicketStyle = (type: Pass['type'], isNext: boolean) => {
    const nextRing = isNext ? 'ring-3 ring-violet-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_25px_rgba(139,92,246,0.5)] z-10' : '';

    switch (normalizePassType(type)) {
      case 'flight':
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
          cardClass: `bg-gradient-to-r from-fuchsia-600 via-purple-700 to-indigo-900 border-fuchsia-500/20 text-white ${nextRing}`,
          punchClass: 'bg-slate-950 border-fuchsia-500/10',
          dashClass: 'border-fuchsia-300/20',
          badgeClass: 'bg-white/10 text-fuchsia-200 border-white/10',
          textMuted: 'text-fuchsia-200',
          textBold: 'text-white',
          iconBg: 'bg-white/10 text-white border-white/10'
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
      {sortedPasses.map((pass, index) => {
        const isNext = pass.id === nextRequiredId;
        const style = getTicketStyle(pass.type, isNext);
        const isPast = !isNext && new Date(`${pass.date}T${pass.time || '00:00'}`).getTime() < new Date().getTime();

        return (
          <div
            key={pass.id || index}
            ref={(el) => {
              if (pass.id) itemRefs.current[pass.id] = el;
            }}
            className={`relative transition-all duration-300 ${isPast ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
          >
            {/* Timeline Node Icon (positioned absolutely on the left border line) */}
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

            {/* Main Item Card (Themed Ticket Stub) */}
            <div
              onClick={() => onSelectPass(pass)}
              className={`relative rounded-3xl border cursor-pointer flex flex-col transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] overflow-hidden ${style.cardClass}`}
            >
              {/* Ticket punches (semi-circles indenting from left and right edges) */}
              <div className={`absolute left-0 bottom-[46px] w-4.5 h-4.5 rounded-r-full -translate-x-2.5 z-20 border-r border-t border-b ${style.punchClass}`} />
              <div className={`absolute right-0 bottom-[46px] w-4.5 h-4.5 rounded-l-full translate-x-2.5 z-20 border-l border-t border-b ${style.punchClass}`} />
              
              {/* Ticket Perforation Dashed Line */}
              <div className={`absolute left-4 right-4 bottom-13.5 border-b border-dashed z-20 ${style.dashClass}`} />

              {/* Top part: Main Details */}
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
                    <p className={`text-xs mt-0.5 font-medium ${style.textMuted}`}>{pass.location}</p>
                  </div>
                  
                  {/* Decorative watermarked type icon inside card */}
                  <div className={`p-2.5 rounded-2xl border hidden sm:block ${style.iconBg}`}>
                    {getIcon(pass.type)}
                  </div>
                </div>
              </div>

              {/* Bottom part: Stub (Below the dashed line) */}
              <div className="px-5 py-3 h-14 flex items-center justify-between z-10 bg-black/10">
                <span className={`text-[10px] uppercase font-black tracking-wider font-mono ${style.textMuted}`}>
                  {getPassTypeStubLabel(pass.type)}
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
                  ) : (
                    pass.confirmationCode && (
                      <div className="text-right">
                        <span className={`text-[8px] block uppercase font-sans leading-none mb-0.5 ${style.textMuted}`}>Confirm #</span>
                        <span className={`${style.textBold} font-bold`}>{pass.confirmationCode}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
