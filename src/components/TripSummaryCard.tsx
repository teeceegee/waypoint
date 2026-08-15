import React from 'react';
import { type Trip, type Pass } from '../db';
import { normalizePassType } from '../passTypes';
import { Plane, Hotel, Train, Calendar, MapPin, Ticket, Compass, Utensils, Bus, ChevronRight } from 'lucide-react';

interface TripSummaryCardProps {
  trip: Trip;
  passes: Pass[];
  onClick: () => void;
}

export const TripSummaryCard: React.FC<TripSummaryCardProps> = ({ trip, passes, onClick }) => {
  // Count the types of passes
  const flightCount = passes.filter(p => normalizePassType(p.type) === 'flight').length;
  const hotelCount = passes.filter(p => normalizePassType(p.type) === 'hotel').length;
  const trainCount = passes.filter(p => normalizePassType(p.type) === 'train').length;
  const busCount = passes.filter(p => normalizePassType(p.type) === 'bus').length;
  const restaurantCount = passes.filter(p => normalizePassType(p.type) === 'restaurant').length;
  const activityCount = passes.filter(p => normalizePassType(p.type) === 'activity').length;
  const otherCount = passes.filter(p => normalizePassType(p.type) === 'other').length;

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const start = new Date(startStr).toLocaleDateString('en-US', options);
      const end = new Date(endStr).toLocaleDateString('en-US', options);
      return `${start} - ${end}`;
    } catch {
      return `${startStr} - ${endStr}`;
    }
  };

  return (
    <div
      onClick={onClick}
      className="w-full p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-violet-500/30 hover:from-slate-900/100 transition-all duration-300 shadow-xl cursor-pointer group flex flex-col justify-between min-h-[180px] relative overflow-hidden"
    >
      {/* Decorative gradient blur in background */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all duration-500" />
      
      <div>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 font-mono">
              Trip
            </span>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-violet-400 transition-colors">
              <MapPin className="w-4.5 h-4.5 text-slate-400" />
              {trip.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{trip.description}</p>
          </div>
          <div className="p-2 bg-slate-900 rounded-full border border-white/10 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white" />
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-3 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>
      </div>

      {/* Summary Chips Grid */}
      <div className="flex flex-wrap gap-2 pt-4 mt-auto border-t border-white/5">
        {flightCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/30 border border-sky-500/20 text-sky-300 text-[11px] font-semibold font-mono">
            <Plane className="w-3.5 h-3.5" />
            <span>{flightCount} {flightCount === 1 ? 'Flight' : 'Flights'}</span>
          </div>
        )}
        
        {hotelCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold font-mono">
            <Hotel className="w-3.5 h-3.5" />
            <span>{hotelCount} {hotelCount === 1 ? 'Hotel' : 'Hotels'}</span>
          </div>
        )}

        {trainCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-300 text-[11px] font-semibold font-mono">
            <Train className="w-3.5 h-3.5" />
            <span>{trainCount} {trainCount === 1 ? 'Train' : 'Trains'}</span>
          </div>
        )}

        {busCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-950/30 border border-orange-500/20 text-orange-300 text-[11px] font-semibold font-mono">
            <Bus className="w-3.5 h-3.5" />
            <span>{busCount} {busCount === 1 ? 'Bus' : 'Buses'}</span>
          </div>
        )}

        {restaurantCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-[11px] font-semibold font-mono">
            <Utensils className="w-3.5 h-3.5" />
            <span>{restaurantCount} {restaurantCount === 1 ? 'Dining' : 'Dining'}</span>
          </div>
        )}

        {activityCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fuchsia-950/30 border border-fuchsia-500/20 text-fuchsia-300 text-[11px] font-semibold font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>{activityCount} {activityCount === 1 ? 'Activity' : 'Activities'}</span>
          </div>
        )}

        {otherCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/40 border border-white/10 text-slate-300 text-[11px] font-semibold font-mono">
            <Ticket className="w-3.5 h-3.5" />
            <span>{otherCount} {otherCount === 1 ? 'Doc' : 'Docs'}</span>
          </div>
        )}

        {passes.length === 0 && (
          <span className="text-xs text-slate-500 italic py-0.5">No items in wallet yet</span>
        )}
      </div>
    </div>
  );
};
