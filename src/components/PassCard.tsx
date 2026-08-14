import React from 'react';
import { type Pass } from '../db';
import { Plane, Hotel, Train, Calendar, Ticket, Compass, Utensils, Bus } from 'lucide-react';

interface PassCardProps {
  pass: Pass;
  onClick: () => void;
}

export const PassCard: React.FC<PassCardProps> = ({ pass, onClick }) => {
  const getIcon = () => {
    switch (pass.type) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'restaurant': return <Utensils className="w-5 h-5" />;
      case 'activity': return <Compass className="w-5 h-5" />;
      default: return <Ticket className="w-5 h-5" />;
    }
  };

  const getTicketStyle = (type: Pass['type']) => {
    switch (type) {
      case 'flight':
        return {
          cardClass: 'bg-gradient-to-r from-blue-700 via-sky-850 to-indigo-900 border-sky-500/30 text-white',
          punchClass: 'bg-slate-950 border-sky-500/20',
          dashClass: 'border-sky-300/30',
          badgeClass: 'bg-white/10 text-sky-200 border-white/10',
          textMuted: 'text-sky-200',
          textBold: 'text-white',
          iconBg: 'bg-white/10 text-white'
        };
      case 'train':
      case 'bus':
        return {
          cardClass: 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 border-amber-400/30 text-slate-950',
          punchClass: 'bg-slate-950 border-amber-600/30',
          dashClass: 'border-amber-900/20',
          badgeClass: 'bg-black/10 text-slate-900 border-black/10 font-bold',
          textMuted: 'text-slate-800 font-semibold',
          textBold: 'text-slate-950 font-black',
          iconBg: 'bg-black/10 text-slate-950'
        };
      case 'hotel':
        return {
          cardClass: 'bg-gradient-to-r from-emerald-600 via-emerald-750 to-teal-850 border-emerald-500/20 text-white',
          punchClass: 'bg-slate-950 border-emerald-500/20',
          dashClass: 'border-emerald-300/30',
          badgeClass: 'bg-white/10 text-emerald-100 border-white/10',
          textMuted: 'text-emerald-100',
          textBold: 'text-white',
          iconBg: 'bg-white/10 text-white'
        };
      case 'restaurant':
        return {
          cardClass: 'bg-gradient-to-r from-rose-900 via-rose-950 to-red-950 border-rose-500/20 text-slate-100',
          punchClass: 'bg-slate-950 border-rose-500/10',
          dashClass: 'border-rose-400/20',
          badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
          textMuted: 'text-rose-300/80',
          textBold: 'text-slate-100',
          iconBg: 'bg-rose-500/10 text-rose-300'
        };
      case 'activity':
        return {
          cardClass: 'bg-gradient-to-r from-fuchsia-600 via-purple-700 to-indigo-900 border-fuchsia-500/20 text-white',
          punchClass: 'bg-slate-950 border-fuchsia-500/10',
          dashClass: 'border-fuchsia-300/20',
          badgeClass: 'bg-white/10 text-fuchsia-200 border-white/10',
          textMuted: 'text-fuchsia-200',
          textBold: 'text-white',
          iconBg: 'bg-white/10 text-white'
        };
      default:
        return {
          cardClass: 'bg-gradient-to-r from-slate-800 to-slate-900 border-white/10 text-slate-100',
          punchClass: 'bg-slate-950 border-white/10',
          dashClass: 'border-white/10',
          badgeClass: 'bg-slate-700 text-slate-200 border-white/5',
          textMuted: 'text-slate-400',
          textBold: 'text-slate-100',
          iconBg: 'bg-slate-700 text-slate-200'
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

  const style = getTicketStyle(pass.type);

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-3xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between h-44 shadow-xl overflow-hidden ${style.cardClass}`}
    >
      {/* Ticket punches (semi-circles indenting from left and right edges) */}
      <div className={`absolute left-0 bottom-[44px] w-4 h-4 rounded-r-full -translate-x-[9px] z-20 border-r border-t border-b ${style.punchClass}`} />
      <div className={`absolute right-0 bottom-[44px] w-4 h-4 rounded-l-full translate-x-[9px] z-20 border-l border-t border-b ${style.punchClass}`} />
      
      {/* Ticket Perforation Dashed Line */}
      <div className={`absolute left-4 right-4 bottom-13 border-b border-dashed z-20 ${style.dashClass}`} />

      {/* Main Header Content */}
      <div className="flex items-start justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border flex items-center justify-center ${style.badgeClass}`}>
            {getIcon()}
          </div>
          <div className="max-w-[160px] sm:max-w-[200px]">
            <h4 className={`font-bold line-clamp-1 text-sm sm:text-base leading-snug ${style.textBold}`}>
              {pass.title}
            </h4>
            <span className={`text-[9px] uppercase tracking-wider font-mono ${style.textMuted}`}>
              {pass.confirmationCode || 'No Ref'}
            </span>
          </div>
        </div>

        {/* Traveler Badge */}
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono border ${style.badgeClass}`}
        >
          {!pass.travelerId || pass.travelerId === 'shared' ? 'shared' : pass.travelerId}
        </span>
      </div>

      {/* Details Row */}
      <div className="flex items-center my-1 z-10 px-0.5">
        {pass.type === 'flight' && (pass.gate || pass.seat) ? (
          <div className="flex items-center gap-4 text-[11px] font-mono">
            {pass.gate && (
              <div>
                <span className={`text-[8px] block uppercase ${style.textMuted}`}>Gate</span>
                <span className={`font-bold ${style.textBold}`}>{pass.gate}</span>
              </div>
            )}
            {pass.seat && (
              <div>
                <span className={`text-[8px] block uppercase ${style.textMuted}`}>Seat</span>
                <span className={`font-bold ${style.textBold}`}>{pass.seat}</span>
              </div>
            )}
          </div>
        ) : (
          <p className={`text-xs line-clamp-1 font-medium ${style.textMuted}`}>
            {pass.location}
          </p>
        )}
      </div>

      {/* Footer Stub (Below the perforated line) */}
      <div className="flex items-center justify-between z-10 pt-2 h-10 border-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 opacity-65" />
          <span className={style.textMuted}>{formatDate(pass.date)}</span>
        </div>
        {pass.time && (
          <div className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${style.badgeClass}`}>
            {pass.time}
          </div>
        )}
      </div>
    </div>
  );
};
