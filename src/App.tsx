import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Pass } from './db';
import { PassDetailsModal } from './components/PassDetailsModal';
import { GroupPassesCarousel } from './components/GroupPassesCarousel';
import { TripSummaryCard } from './components/TripSummaryCard';
import { VerticalTimeline } from './components/VerticalTimeline';
import { SyncModal } from './components/SyncModal';
import { Database, Calendar, MapPin, ArrowLeft } from 'lucide-react';

type ViewMode = 'all' | 'tony' | 'graeme' | 'group';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('all');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  // Modal control states
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Live queries from Dexie.js
  const trips = useLiveQuery(() => db.trips.toArray()) || [];
  const passes = useLiveQuery(() => db.passes.toArray()) || [];

  // The shared wallet is the default. Traveller filters are optional views for
  // bookings such as seats and barcodes that differ between people.
  const getFilteredTrips = () => {
    if (activeView === 'all') return trips;
    if (activeView === 'group') return [];

    return trips.filter(
      (trip) => (trip.travelerId || 'shared') === activeView || (trip.travelerId || 'shared') === 'shared'
    );
  };

  const getFilteredPassesForTrip = (tripId: number) => {
    return passes.filter(
      (pass) => pass.tripId === tripId && (
        activeView === 'all' ||
        activeView === 'group' ||
        (pass.travelerId || 'shared') === activeView ||
        (pass.travelerId || 'shared') === 'shared'
      )
    );
  };

  const currentSelectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 pb-20 select-none">

      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedTripId !== null && (
            <button
              onClick={() => setSelectedTripId(null)}
              className="p-2 mr-1 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex flex-col items-start">
            <span className="text-xl font-black text-slate-100 uppercase tracking-tight">
              Waypoint
            </span>
            <span className="text-[9px] text-slate-400 tracking-wider font-mono mt-0.5">
              SHARED TRAVEL WALLET
            </span>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          {/* Shared view with optional traveller and group filters */}
          <select
            value={activeView}
            onChange={(e) => {
              setActiveView(e.target.value as ViewMode);
              setSelectedTripId(null);
            }}
            aria-label="Filter travel wallet"
            className="bg-slate-900 border border-white/10 text-slate-300 text-xs px-2.5 py-2 rounded-xl focus:outline-none focus:border-violet-500 font-bold tracking-wide cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Trips</option>
            <option value="tony" className="bg-slate-900">Tony</option>
            <option value="graeme" className="bg-slate-900">Graeme</option>
            <option value="group" className="bg-slate-900">Group</option>
          </select>

          <button
            onClick={() => setShowSyncModal(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 transition"
            title="Import/Export Backups"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="w-full max-w-2xl mx-auto px-4 mt-8 flex-1 flex flex-col gap-6">
        
        {/* DRILL-DOWN: DETAILED VERTICAL TIMELINE VIEW */}
        {selectedTripId !== null && currentSelectedTrip ? (
          <div className="space-y-6">
            {/* Header info card for the selected trip */}
            <div className="bg-slate-900/30 rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 font-mono">
                  Currently Viewing Timeline
                </span>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4.5 h-4.5 text-slate-400" />
                  {currentSelectedTrip.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">{currentSelectedTrip.startDate} to {currentSelectedTrip.endDate}</p>
                {currentSelectedTrip.description && (
                  <p className="text-xs text-slate-400 italic mt-2">{currentSelectedTrip.description}</p>
                )}
              </div>
            </div>

            {/* Vertical Timeline Component */}
            <VerticalTimeline
              passes={getFilteredPassesForTrip(currentSelectedTrip.id!)}
              onSelectPass={(pass) => setSelectedPass(pass)}
            />
          </div>
        ) : activeView === 'group' ? (
          
          /* GROUP PASSES CAROUSEL MODE (Shows everything chronologically) */
          <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 shadow-xl">
            <div className="flex flex-col mb-4">
              <h2 className="text-lg font-bold text-slate-200">Group boarding dashboard</h2>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Swipe through all active flight tickets, train passes, and reservation vouchers in chronological order for swift check-in.
              </p>
            </div>
            
            <GroupPassesCarousel
              passes={passes}
              onSelectPass={(pass) => setSelectedPass(pass)}
            />
          </div>
        ) : (
          
          /* TRIP DASHBOARD WITH SUMMARY CARDS */
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider font-mono">
              Scheduled Trips ({getFilteredTrips().length})
            </h2>
            
            {getFilteredTrips().length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-3xl bg-slate-950/20 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="font-bold text-slate-300">No Trips Scheduled</h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-[280px]">
                  No active travel campaigns. Import an update JSON file using the Database icon in the toolbar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {getFilteredTrips().map((trip) => (
                  <TripSummaryCard
                     key={trip.slug}
                     trip={trip}
                     passes={getFilteredPassesForTrip(trip.id!)}
                     onClick={() => setSelectedTripId(trip.id!)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- ALL DYNAMIC OVERLAY MODALS --- */}

      {/* 1. Ticket Details / Barcode Viewer Modal */}
      {selectedPass && (
        <PassDetailsModal
          pass={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}

      {/* 2. Sync Modal (Backup & Restore) */}
      {showSyncModal && (
        <SyncModal
          onClose={() => setShowSyncModal(false)}
        />
      )}

    </div>
  );
}
