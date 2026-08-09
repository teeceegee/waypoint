import React, { useState, useEffect } from 'react';
import { type Trip } from '../db';
import { X } from 'lucide-react';

interface TripFormModalProps {
  trip?: Trip; // If editing, pass the existing trip
  onClose: () => void;
  onSubmit: (tripData: Omit<Trip, 'id'> & { id?: number }) => void;
}

export const TripFormModal: React.FC<TripFormModalProps> = ({
  trip,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [travelerId, setTravelerId] = useState<'tony' | 'graeme' | 'shared'>('shared');

  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setDestination(trip.destination);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setDescription(trip.description || '');
      setTravelerId(trip.travelerId);
    }
  }, [trip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !startDate || !endDate) {
      alert('Please fill out all required fields.');
      return;
    }
    
    onSubmit({
      ...(trip?.id ? { id: trip.id } : {}),
      name,
      destination,
      startDate,
      endDate,
      description,
      travelerId,
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-950/40">
          <h3 className="text-lg font-bold text-slate-100">
            {trip ? 'Edit Trip Settings' : 'Create New Trip'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Trip Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Voyage to Tokyo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Destination *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tokyo, Japan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Trip Details / Description
            </label>
            <textarea
              placeholder="Any details or description for this trip..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Who is participating in this trip?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['tony', 'graeme', 'shared'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTravelerId(id)}
                  className={`py-2 rounded-xl text-xs font-bold border transition uppercase tracking-wider font-mono ${
                    travelerId === id
                      ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {id === 'shared' ? 'Both' : id}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-semibold text-sm shadow-lg transition active:scale-98"
            >
              {trip ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
