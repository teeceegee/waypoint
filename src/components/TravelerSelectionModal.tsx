import React from 'react';
import { UserRoundCheck, UsersRound } from 'lucide-react';
import { formatTravelerId } from '../travelers';

interface TravelerSelectionModalProps {
  travelerIds: string[];
  onSelect: (travelerId: string) => void;
}

export const TravelerSelectionModal: React.FC<TravelerSelectionModalProps> = ({
  travelerIds,
  onSelect,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="traveler-selection-title"
    >
      <div className="relative w-full sm:max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <UsersRound className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 id="traveler-selection-title" className="text-xl font-black text-slate-100">
              Who is using Waypoint?
            </h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Choose one traveller to show their bookings. Shared trip details will be included automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-h-[55vh] overflow-y-auto">
          {travelerIds.map((travelerId) => (
            <button
              key={travelerId}
              type="button"
              onClick={() => onSelect(travelerId)}
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/50 border border-white/10 text-left hover:border-violet-500/50 hover:bg-violet-500/5 active:scale-[0.98] transition"
            >
              <UserRoundCheck className="w-5 h-5 text-violet-400 flex-none" />
              <span className="font-bold text-slate-200 truncate">{formatTravelerId(travelerId)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
