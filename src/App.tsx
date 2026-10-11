import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Pass } from './db';
import { TripSummaryCard } from './components/TripSummaryCard';
import {
  VerticalTimeline,
  TimelineFilterBar,
  DEFAULT_TIMELINE_FILTERS,
  type FilterCategory,
} from './components/VerticalTimeline';
import { TravelerSelectionModal } from './components/TravelerSelectionModal';
import { formatTravelerId, getTravelerIds, SHARED_TRAVELER_ID } from './travelers';
import { APP_VERSION } from './version';
import { Database, Calendar, MapPin, ArrowLeft } from 'lucide-react';

const PassDetailsModal = lazy(() =>
  import('./components/PassDetailsModal').then((m) => ({ default: m.PassDetailsModal }))
);
const SyncModal = lazy(() =>
  import('./components/SyncModal').then((m) => ({ default: m.SyncModal }))
);

const SELECTED_TRAVELER_STORAGE_KEY = 'waypoint:selectedTravelerId';

export default function App() {
  const [selectedTravelerId, setSelectedTravelerId] = useState<string | null>(() =>
    localStorage.getItem(SELECTED_TRAVELER_STORAGE_KEY)
  );
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<FilterCategory, boolean>>(
    DEFAULT_TIMELINE_FILTERS
  );

  const toggleFilter = (category: FilterCategory) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const resetFilters = () => {
    setActiveFilters(DEFAULT_TIMELINE_FILTERS);
  };

  const selectTrip = (tripId: number | null) => {
    setSelectedTripId(tripId);
    setActiveFilters(DEFAULT_TIMELINE_FILTERS);
    if (tripId === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modal control states
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [travelerSelectionOptions, setTravelerSelectionOptions] = useState<string[]>([]);
  const [showTravelerSelection, setShowTravelerSelection] = useState(false);

  // Live queries from Dexie.js
  const tripsQuery = useLiveQuery(() => db.trips.toArray());
  const passesQuery = useLiveQuery(() => db.passes.toArray());
  const trips = tripsQuery || [];
  const passes = passesQuery || [];
  const travelerIds = useMemo(
    () => getTravelerIds(tripsQuery || [], passesQuery || []),
    [tripsQuery, passesQuery]
  );
  const dataLoaded = tripsQuery !== undefined && passesQuery !== undefined;

  useEffect(() => {
    if (!dataLoaded) return;

    if (travelerIds.length === 0) {
      if (selectedTravelerId !== null) {
        localStorage.removeItem(SELECTED_TRAVELER_STORAGE_KEY);
        setSelectedTravelerId(null);
      }
      return;
    }

    if (!selectedTravelerId || !travelerIds.includes(selectedTravelerId)) {
      setTravelerSelectionOptions(travelerIds);
      setShowTravelerSelection(true);
    }
  }, [dataLoaded, selectedTravelerId, travelerIds]);

  const selectTraveler = (travelerId: string) => {
    localStorage.setItem(SELECTED_TRAVELER_STORAGE_KEY, travelerId);
    setSelectedTravelerId(travelerId);
    selectTrip(null);
    setShowTravelerSelection(false);
  };

  const handleImportComplete = (importedTravelerIds: string[]) => {
    selectTrip(null);
    if (importedTravelerIds.length > 0) {
      setTravelerSelectionOptions(importedTravelerIds);
      setShowTravelerSelection(true);
    }
  };

  const handleDataCleared = () => {
    localStorage.removeItem(SELECTED_TRAVELER_STORAGE_KEY);
    setSelectedTravelerId(null);
    selectTrip(null);
    setShowTravelerSelection(false);
  };

  const getFilteredTrips = () => {
    if (travelerIds.length === 0) return trips;
    if (!selectedTravelerId) return [];

    return trips.filter(
      (trip) =>
        (trip.travelerId || SHARED_TRAVELER_ID) === selectedTravelerId ||
        (trip.travelerId || SHARED_TRAVELER_ID) === SHARED_TRAVELER_ID
    );
  };

  const getFilteredPassesForTrip = (tripId: number) => {
    return passes.filter(
      (pass) => pass.tripId === tripId && (
        travelerIds.length === 0 ||
        (pass.travelerId || SHARED_TRAVELER_ID) === selectedTravelerId ||
        (pass.travelerId || SHARED_TRAVELER_ID) === SHARED_TRAVELER_ID
      )
    );
  };

  const currentSelectedTrip = trips.find(t => t.id === selectedTripId);
  const currentTripPasses = currentSelectedTrip
    ? getFilteredPassesForTrip(currentSelectedTrip.id!)
    : [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 pb-20 select-none">

      {/* HEADER BAR (Non-Scrollable Sticky Top Area) */}
      <header className="sticky top-0 z-30 glass border-b border-white/5 py-3.5 px-4 sm:px-6 flex flex-col gap-3">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedTripId !== null && (
              <button
                onClick={() => selectTrip(null)}
                className="p-2 mr-1 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white transition active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex flex-col items-start">
              <span className="text-xl font-black text-slate-100 uppercase tracking-tight">
                Waypoint
              </span>
              <button
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                      for (const reg of registrations) {
                        reg.update();
                      }
                    });
                  }
                  window.location.reload();
                }}
                title="Click to check for updates & reload"
                className="text-[9px] text-slate-400 hover:text-slate-200 tracking-wider font-mono mt-0.5 text-left transition cursor-pointer"
              >
                SHARED TRAVEL WALLET v{APP_VERSION}
              </button>
            </div>
          </div>

          {/* Global Toolbar buttons */}
          <div className="flex items-center gap-2">
            {travelerIds.length > 0 && (
              <select
                value={selectedTravelerId || ''}
                onChange={(event) => selectTraveler(event.target.value)}
                aria-label="Choose traveller"
                className="max-w-36 bg-slate-900 border border-white/10 text-slate-300 text-xs px-2.5 py-2 rounded-xl focus:outline-none focus:border-violet-500 font-bold tracking-wide cursor-pointer"
              >
                <option value="" disabled>Choose traveller</option>
                {travelerIds.map((travelerId) => (
                  <option key={travelerId} value={travelerId} className="bg-slate-900">
                    {formatTravelerId(travelerId)}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowSyncModal(true)}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 transition"
              title="Import/Export Backups"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sticky Category Filter Bar (Always visible when viewing a trip) */}
        {selectedTripId !== null && currentSelectedTrip && (
          <TimelineFilterBar
            passes={currentTripPasses}
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
          />
        )}
      </header>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="w-full max-w-2xl mx-auto px-4 mt-6 flex-1 flex flex-col gap-6">
        
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
              key={currentSelectedTrip.id ?? currentSelectedTrip.slug}
              passes={currentTripPasses}
              onSelectPass={(pass) => setSelectedPass(pass)}
              activeFilters={activeFilters}
              onResetFilters={resetFilters}
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
                     onClick={() => selectTrip(trip.id!)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- ALL DYNAMIC OVERLAY MODALS --- */}
      <Suspense fallback={null}>
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
            onImportComplete={handleImportComplete}
            onDataCleared={handleDataCleared}
          />
        )}
      </Suspense>

      {showTravelerSelection && travelerSelectionOptions.length > 0 && (
        <TravelerSelectionModal
          travelerIds={travelerSelectionOptions}
          onSelect={selectTraveler}
        />
      )}

    </div>
  );
}
