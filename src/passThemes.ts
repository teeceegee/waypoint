import { type Pass } from './db';
import { normalizePassType } from './passTypes';

export interface TicketCardTheme {
  cardClass: string;
  punchClass: string;
  dashClass: string;
  badgeClass: string;
  textMuted: string;
  textBold: string;
  iconBg: string;
}

export interface PassModalTheme {
  containerBg: string;
  headerBg: string;
  titleText: string;
  subtitleText: string;
  labelText: string;
  valueText: string;
  cardBg: string;
  btnClass: string;
  deleteBtnClass: string;
}

/**
 * Returns the visual theme tokens for a Level 2 timeline ticket stub card.
 */
export const getTicketStyle = (
  type: Pass['type'],
  isNext: boolean,
  status?: string
): TicketCardTheme => {
  const nextRing = isNext
    ? 'ring-3 ring-violet-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_25px_rgba(139,92,246,0.5)] z-10'
    : '';

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
          iconBg: 'bg-white/20 text-white border-white/20',
        };
      }
      return {
        cardClass: `bg-gradient-to-r from-blue-700 via-sky-800 to-indigo-900 border-sky-500/30 text-white ${nextRing}`,
        punchClass: 'bg-slate-950 border-sky-500/20',
        dashClass: 'border-sky-300/30',
        badgeClass: 'bg-white/10 text-sky-200 border-white/10',
        textMuted: 'text-sky-200',
        textBold: 'text-white',
        iconBg: 'bg-white/10 text-white border-white/15',
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
        iconBg: 'bg-black/10 text-slate-950 border-black/10',
      };
    case 'hotel':
      return {
        cardClass: `bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 border-emerald-500/20 text-white ${nextRing}`,
        punchClass: 'bg-slate-950 border-emerald-500/20',
        dashClass: 'border-emerald-300/30',
        badgeClass: 'bg-white/10 text-emerald-100 border-white/10',
        textMuted: 'text-emerald-100',
        textBold: 'text-white',
        iconBg: 'bg-white/10 text-white border-white/15',
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
          iconBg: 'bg-white/15 text-white border-white/15',
        };
      }
      return {
        cardClass: `bg-gradient-to-r from-rose-900 via-rose-950 to-red-950 border-rose-500/20 text-slate-100 ${nextRing}`,
        punchClass: 'bg-slate-950 border-rose-500/10',
        dashClass: 'border-rose-400/20',
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
        textMuted: 'text-rose-300/80',
        textBold: 'text-slate-100',
        iconBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      };
    case 'activity':
      return {
        cardClass: `bg-gradient-to-br from-white via-slate-50 to-slate-100 border-white/80 text-slate-950 shadow-2xl ${nextRing}`,
        punchClass: 'bg-slate-950 border-slate-300/80',
        dashClass: 'border-slate-300/80',
        badgeClass: 'bg-black/10 text-slate-900 border-black/10 font-bold',
        textMuted: 'text-slate-600 font-semibold',
        textBold: 'text-slate-950 font-black',
        iconBg: 'bg-black/10 text-slate-950 border-black/10',
      };
    default:
      return {
        cardClass: `bg-gradient-to-r from-slate-800 to-slate-900 border-white/10 text-slate-100 ${nextRing}`,
        punchClass: 'bg-slate-950 border-white/10',
        dashClass: 'border-white/10',
        badgeClass: 'bg-slate-700 text-slate-200 border-white/5',
        textMuted: 'text-slate-400',
        textBold: 'text-slate-100',
        iconBg: 'bg-slate-700 text-slate-200 border-white/5',
      };
  }
};

/**
 * Returns the visual theme tokens for the PassDetailsModal overlay.
 */
export const getModalStyle = (type: Pass['type'], status?: string): PassModalTheme => {
  switch (normalizePassType(type)) {
    case 'flight':
      if (status === 'recommended' || status === 'planned') {
        return {
          containerBg:
            'bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white border-sky-300/40 shadow-2xl',
          headerBg: 'border-b border-white/15 bg-black/10',
          titleText: 'text-white font-black',
          subtitleText: 'text-sky-100 font-medium',
          labelText: 'text-sky-100/80',
          valueText: 'text-white',
          cardBg: 'bg-black/15 border border-white/10',
          btnClass: 'text-white/80 hover:text-white hover:bg-white/10',
          deleteBtnClass: 'text-red-200 hover:text-white hover:bg-red-500/20',
        };
      }
      return {
        containerBg:
          'bg-gradient-to-br from-blue-700 via-sky-800 to-indigo-900 text-white border-sky-400/30',
        headerBg: 'border-b border-white/10 bg-black/10',
        titleText: 'text-white',
        subtitleText: 'text-sky-200 opacity-80',
        labelText: 'text-sky-200/70',
        valueText: 'text-white',
        cardBg: 'bg-black/15 border border-white/5',
        btnClass: 'text-white/70 hover:text-white hover:bg-white/10',
        deleteBtnClass: 'text-red-300 hover:text-red-200 hover:bg-red-500/20',
      };
    case 'train':
    case 'bus':
      return {
        containerBg:
          'bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 text-slate-950 border-amber-300/30',
        headerBg: 'border-b border-black/10 bg-black/5',
        titleText: 'text-slate-950 font-black',
        subtitleText: 'text-slate-800 font-bold',
        labelText: 'text-slate-800/80 font-bold',
        valueText: 'text-slate-950 font-extrabold',
        cardBg: 'bg-black/5 border border-black/5',
        btnClass: 'text-slate-950/70 hover:text-slate-950 hover:bg-black/10',
        deleteBtnClass: 'text-red-800 hover:text-red-900 hover:bg-red-500/20',
      };
    case 'hotel':
      return {
        containerBg:
          'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-400/30 border-l-4 border-l-emerald-500',
        headerBg: 'border-b border-white/10 bg-black/10',
        titleText: 'text-white font-extrabold',
        subtitleText: 'text-emerald-100 font-bold',
        labelText: 'text-emerald-100/70',
        valueText: 'text-white',
        cardBg: 'bg-black/15 border border-white/5',
        btnClass: 'text-white/70 hover:text-white hover:bg-white/10',
        deleteBtnClass: 'text-red-300 hover:text-red-200 hover:bg-red-500/20',
      };
    case 'restaurant':
      if (status === 'recommended') {
        return {
          containerBg:
            'bg-gradient-to-br from-rose-700 via-rose-600 to-amber-700 text-white border-rose-400/30 shadow-2xl',
          headerBg: 'border-b border-white/10 bg-black/10',
          titleText: 'text-white font-extrabold',
          subtitleText: 'text-rose-100 font-bold',
          labelText: 'text-rose-100/80 font-semibold',
          valueText: 'text-white font-bold',
          cardBg: 'bg-black/15 border border-white/10',
          btnClass: 'text-white/80 hover:text-white hover:bg-white/10',
          deleteBtnClass: 'text-red-200 hover:text-white hover:bg-red-500/20',
        };
      }
      return {
        containerBg:
          'bg-gradient-to-br from-rose-900 via-rose-950 to-red-950 text-white border-rose-500/20',
        headerBg: 'border-b border-white/10 bg-black/10',
        titleText: 'text-white font-bold',
        subtitleText: 'text-rose-200',
        labelText: 'text-rose-200/70',
        valueText: 'text-white',
        cardBg: 'bg-black/15 border border-white/5',
        btnClass: 'text-white/70 hover:text-white hover:bg-white/10',
        deleteBtnClass: 'text-red-300 hover:text-red-200 hover:bg-red-500/20',
      };
    case 'activity':
      return {
        containerBg:
          'bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-950 border-white/60 shadow-2xl',
        headerBg: 'border-b border-black/10 bg-black/5',
        titleText: 'text-slate-950 font-black',
        subtitleText: 'text-slate-700 font-bold',
        labelText: 'text-slate-600/90 font-bold',
        valueText: 'text-slate-950 font-extrabold',
        cardBg: 'bg-black/5 border border-black/10',
        btnClass: 'text-slate-900 hover:text-black hover:bg-black/10',
        deleteBtnClass: 'text-red-700 hover:text-red-900 hover:bg-red-500/20',
      };
    default:
      return {
        containerBg: 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-white/10',
        headerBg: 'border-b border-white/10 bg-black/10',
        titleText: 'text-white',
        subtitleText: 'text-slate-300',
        labelText: 'text-slate-400',
        valueText: 'text-slate-100',
        cardBg: 'bg-black/15 border border-white/5',
        btnClass: 'text-slate-300 hover:text-white hover:bg-white/5',
        deleteBtnClass: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
      };
  }
};
