import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabase, type Pass } from './db';
import { OnboardingModal } from './components/OnboardingModal';
import { PassDetailsModal } from './components/PassDetailsModal';
import { GroupPassesCarousel } from './components/GroupPassesCarousel';
import { TripSummaryCard } from './components/TripSummaryCard';
import { VerticalTimeline } from './components/VerticalTimeline';
import { SyncModal } from './components/SyncModal';
import { Database, Calendar, MapPin, ArrowLeft, Smartphone } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [deviceOwner, setDeviceOwner] = useState<'tony' | 'graeme' | null>(null);
  const [activeProfile, setActiveProfile] = useState<'tony' | 'graeme'>('tony');
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeView, setActiveView] = useState<'individual' | 'group'>('individual');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  // Modal control states
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Live queries from Dexie.js
  const trips = useLiveQuery(() => db.trips.toArray()) || [];
  const passes = useLiveQuery(() => db.passes.toArray()) || [];

  // Initialize DB and configurations
  useEffect(() => {
    const initApp = async () => {
      try {
        await seedDatabase();
        
        // Retrieve or detect identity choice
        const savedOwner = localStorage.getItem('waypoint_device_owner');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);
        setIsIOSDevice(isIOS);

        if (savedOwner === 'tony' || savedOwner === 'graeme') {
          setDeviceOwner(savedOwner);
          setActiveProfile(savedOwner);
        } else {
          // If iOS, auto-default to 'tony' but still show the prompt
          if (isIOS) {
            localStorage.setItem('waypoint_device_owner', 'tony');
            setDeviceOwner('tony');
            setActiveProfile('tony');
          }
          setShowOnboarding(true);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const handleOnboardingComplete = (owner: 'tony' | 'graeme') => {
    localStorage.setItem('waypoint_device_owner', owner);
    setDeviceOwner(owner);
    setActiveProfile(owner);
    setShowOnboarding(false);
  };

  const handleImportComplete = () => {
    // Refresh device configurations if backup loaded
    const savedOwner = localStorage.getItem('waypoint_device_owner');
    if (savedOwner === 'tony' || savedOwner === 'graeme') {
      setDeviceOwner(savedOwner);
      setActiveProfile(savedOwner);
    }
  };

  // Filter trips based on active traveler profile
  const getFilteredTrips = () => {
    return trips.filter(
      (t) => t.travelerId === activeProfile || t.travelerId === 'shared'
    );
  };

  // Filter passes based on traveler context and trip ID
  const getFilteredPassesForTrip = (tripId: number) => {
    return passes.filter(
      (p) =>
        p.tripId === tripId &&
        (p.travelerId === activeProfile || p.travelerId === 'shared')
    );
  };

  const currentSelectedTrip = trips.find(t => t.id === selectedTripId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Loading database...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 pb-20 select-none">
      
      {/* Onboarding Trigger */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* HEADER BAR (Tailored iOS PWA design) */}
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
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-100 uppercase tracking-tight">
                Waypoint
              </span>
              {isIOSDevice && (
                <span className="px-1.5 py-0.5 rounded-md bg-violet-600/10 text-violet-400 border border-violet-500/20 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5" /> iOS
                </span>
              )}
            </div>
            {deviceOwner && (
              <span className="text-[9px] text-slate-400 tracking-wider font-mono mt-0.5">
                PHONE OWNER: <strong className="text-violet-400 uppercase">{deviceOwner}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          {/* Subtle Profile Switcher in the Header */}
          <select
            value={activeView === 'group' ? 'group' : activeProfile}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'group') {
                setActiveView('group');
              } else {
                setActiveView('individual');
                setActiveProfile(val as 'tony' | 'graeme');
              }
            }}
            className="bg-slate-900 border border-white/10 text-slate-300 text-xs px-2.5 py-2 rounded-xl focus:outline-none focus:border-violet-500 font-bold tracking-wide cursor-pointer"
          >
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
          onImportComplete={handleImportComplete}
        />
      )}

    </div>
  );
}
