import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabase, type Trip, type Pass } from './db';
import { OnboardingModal } from './components/OnboardingModal';
import { PassDetailsModal } from './components/PassDetailsModal';
import { GroupPassesCarousel } from './components/GroupPassesCarousel';
import { TripSummaryCard } from './components/TripSummaryCard';
import { VerticalTimeline } from './components/VerticalTimeline';
import { TripFormModal } from './components/TripFormModal';
import { PassFormModal } from './components/PassFormModal';
import { SyncModal } from './components/SyncModal';
import { Plus, Database, Calendar, MapPin, Trash2, Edit2, ArrowLeft, Smartphone } from 'lucide-react';

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    // Only compress images larger than 1MB
    if (!file.type.startsWith('image/') || file.size < 1 * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 1600; // Limit max resolution to 1600px
        let w = img.width;
        let h = img.height;
        if (w > max || h > max) {
          if (w > h) {
            h = Math.round((h * max) / w);
            w = max;
          } else {
            w = Math.round((w * max) / h);
            h = max;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.75 // 75% quality JPEG
          );
        } else {
          resolve(file);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

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
  const [editingPass, setEditingPass] = useState<Pass | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showTripForm, setShowTripForm] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [activeTripForNewPass, setActiveTripForNewPass] = useState<number | undefined>(undefined);
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

  // Add a new trip to the database
  const handleCreateOrUpdateTrip = async (tripData: Omit<Trip, 'id'> & { id?: number }) => {
    try {
      if (tripData.id) {
        await db.trips.update(tripData.id, tripData);
      } else {
        await db.trips.add(tripData);
      }
      setEditingTrip(null);
      setShowTripForm(false);
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  };

  // Delete a trip and clean up associated passes and binary attachments
  const handleDeleteTrip = async (tripId: number) => {
    if (window.confirm('Delete this trip and ALL associated boarding passes and document attachments? This cannot be undone.')) {
      try {
        const associatedPasses = await db.passes.where('tripId').equals(tripId).toArray();
        for (const p of associatedPasses) {
          if (p.attachmentId) {
            await db.attachments.delete(p.attachmentId);
          }
          if (p.id) {
            await db.passes.delete(p.id);
          }
        }
        await db.trips.delete(tripId);
        // If we currently view this trip, go back to main dashboard
        if (selectedTripId === tripId) {
          setSelectedTripId(null);
        }
      } catch (err) {
        console.error('Failed to delete trip:', err);
      }
    }
  };

  // Create or edit a pass in IndexedDB, handling local file attachments
  const handleCreateOrUpdatePass = async (
    passData: Omit<Pass, 'id'> & {
      id?: number;
      attachmentFile?: File | null;
      deleteExistingAttachment?: boolean;
    }
  ) => {
    try {
      let attachmentId = passData.attachmentId;

      // Handle attachment deletion
      if (passData.deleteExistingAttachment && attachmentId) {
        await db.attachments.delete(attachmentId);
        attachmentId = undefined;
      }

      // Handle new file attachment upload
      if (passData.attachmentFile) {
        if (attachmentId) {
          await db.attachments.delete(attachmentId);
        }

        let fileData: Blob = passData.attachmentFile;
        // Compress image file if it's large
        if (passData.attachmentFile.type.startsWith('image/')) {
          fileData = await compressImage(passData.attachmentFile);
        }

        attachmentId = await db.attachments.add({
          fileName: passData.attachmentFile.name,
          fileType: passData.attachmentFile.type,
          data: fileData, // File blob stores directly into IndexedDB
        });
      }

      const cleanPassData: Omit<Pass, 'id'> = {
        tripId: passData.tripId,
        title: passData.title,
        type: passData.type,
        travelerId: passData.travelerId,
        date: passData.date,
        time: passData.time,
        location: passData.location,
        gate: passData.gate,
        seat: passData.seat,
        confirmationCode: passData.confirmationCode,
        barcodeType: passData.barcodeType,
        barcodeContent: passData.barcodeContent,
        notes: passData.notes,
        attachmentId,
      };

      if (passData.id) {
        await db.passes.update(passData.id, cleanPassData);
        // Refresh details modal with updated details
        if (selectedPass?.id === passData.id) {
          setSelectedPass({ id: passData.id, ...cleanPassData });
        }
      } else {
        await db.passes.add(cleanPassData);
      }

      setEditingPass(null);
      setShowPassForm(false);
      setActiveTripForNewPass(undefined);
    } catch (err) {
      console.error('Failed to save pass:', err);
    }
  };

  // Delete a single pass from database and purge associated files
  const handleDeletePass = async (passId: number) => {
    try {
      const passRecord = await db.passes.get(passId);
      if (passRecord?.attachmentId) {
        await db.attachments.delete(passRecord.attachmentId);
      }
      await db.passes.delete(passId);
      setSelectedPass(null);
    } catch (err) {
      console.error('Failed to delete pass:', err);
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
          
          <button
            onClick={() => setShowTripForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Trip</span>
          </button>
        </div>
      </header>

      {/* Segmented view controller removed - replaced by header profile switcher */}

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
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-slate-400" />
                  {currentSelectedTrip.name}
                </h2>
                <p className="text-xs text-slate-400">{currentSelectedTrip.startDate} to {currentSelectedTrip.endDate}</p>
                {currentSelectedTrip.description && (
                  <p className="text-xs text-slate-400 italic mt-2">{currentSelectedTrip.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                <button
                  onClick={() => setEditingTrip(currentSelectedTrip)}
                  className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteTrip(currentSelectedTrip.id!)}
                  className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button
                  onClick={() => {
                    setActiveTripForNewPass(currentSelectedTrip.id);
                    setShowPassForm(true);
                  }}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Ticket
                </button>
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
                  Start local-first travel planning by creating your first trip.
                </p>
                <button
                  onClick={() => setShowTripForm(true)}
                  className="mt-5 px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Create a Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {getFilteredTrips().map((trip) => (
                  <TripSummaryCard
                    key={trip.id}
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
          onEdit={() => {
            setEditingPass(selectedPass);
            setSelectedPass(null);
            setShowPassForm(true);
          }}
          onDelete={handleDeletePass}
        />
      )}

      {/* 2. Create/Edit Trip Modal */}
      {(showTripForm || editingTrip) && (
        <TripFormModal
          trip={editingTrip || undefined}
          onClose={() => {
            setEditingTrip(null);
            setShowTripForm(false);
          }}
          onSubmit={handleCreateOrUpdateTrip}
        />
      )}

      {/* 3. Create/Edit Ticket Modal */}
      {(showPassForm || editingPass) && (
        <PassFormModal
          pass={editingPass || undefined}
          trips={trips}
          defaultTripId={activeTripForNewPass}
          onClose={() => {
            setEditingPass(null);
            setShowPassForm(false);
            setActiveTripForNewPass(undefined);
          }}
          onSubmit={handleCreateOrUpdatePass}
        />
      )}

      {/* 4. Sync Modal (Backup & Restore) */}
      {showSyncModal && (
        <SyncModal
          onClose={() => setShowSyncModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}

    </div>
  );
}
