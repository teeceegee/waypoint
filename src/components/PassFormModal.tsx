import React, { useState, useEffect } from 'react';
import { type Pass, type Trip, db, type Attachment } from '../db';
import { X, Upload, FileText, CheckCircle, Trash } from 'lucide-react';

interface PassFormModalProps {
  pass?: Pass;
  trips: Trip[];
  defaultTripId?: number;
  onClose: () => void;
  onSubmit: (passData: Omit<Pass, 'id'> & { id?: number, attachmentFile?: File | null, deleteExistingAttachment?: boolean }) => void;
}

export const PassFormModal: React.FC<PassFormModalProps> = ({
  pass,
  trips,
  defaultTripId,
  onClose,
  onSubmit,
}) => {
  const [tripId, setTripId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Pass['type']>('flight');
  const [travelerId, setTravelerId] = useState<Pass['travelerId']>('tony');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [gate, setGate] = useState('');
  const [seat, setSeat] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [barcodeType, setBarcodeType] = useState<Pass['barcodeType']>('none');
  const [barcodeContent, setBarcodeContent] = useState('');
  const [notes, setNotes] = useState('');
  
  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<Attachment | null>(null);
  const [deleteExistingAttachment, setDeleteExistingAttachment] = useState(false);

  useEffect(() => {
    // Populate default trip ID
    if (defaultTripId) {
      setTripId(defaultTripId);
    } else if (trips.length > 0) {
      setTripId(trips[0].id || 0);
    }

    const loadExistingAttachment = async () => {
      if (pass?.attachmentId) {
        try {
          const record = await db.attachments.get(pass.attachmentId);
          if (record) {
            setExistingAttachment(record);
          }
        } catch (err) {
          console.error('Failed to load existing attachment details:', err);
        }
      }
    };

    if (pass) {
      setTripId(pass.tripId);
      setTitle(pass.title);
      setType(pass.type);
      setTravelerId(pass.travelerId);
      setDate(pass.date);
      setTime(pass.time || '');
      setLocation(pass.location);
      setGate(pass.gate || '');
      setSeat(pass.seat || '');
      setConfirmationCode(pass.confirmationCode || '');
      setBarcodeType(pass.barcodeType);
      setBarcodeContent(pass.barcodeContent || '');
      setNotes(pass.notes || '');
      loadExistingAttachment();
    }
  }, [pass, trips, defaultTripId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDeleteExistingAttachment(true); // If we upload a new one, mark old for removal
    }
  };

  const handleRemoveExistingAttachment = () => {
    setExistingAttachment(null);
    setDeleteExistingAttachment(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tripId || !date || !location) {
      alert('Please fill out all required fields.');
      return;
    }

    onSubmit({
      ...(pass?.id ? { id: pass.id } : {}),
      tripId: Number(tripId),
      title,
      type,
      travelerId,
      date,
      time: time || undefined,
      location,
      gate: gate || undefined,
      seat: seat || undefined,
      confirmationCode: confirmationCode || undefined,
      barcodeType,
      barcodeContent: barcodeContent || undefined,
      notes: notes || undefined,
      attachmentId: pass?.attachmentId, // Carry over old ID if not deleted
      attachmentFile: selectedFile,
      deleteExistingAttachment: deleteExistingAttachment && !selectedFile,
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-xl bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-950/40">
          <h3 className="text-lg font-bold text-slate-100">
            {pass ? 'Edit Ticket Settings' : 'Add Boarding Pass / Ticket'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          
          {/* Trip Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Select Trip *
            </label>
            <select
              value={tripId}
              required
              onChange={(e) => setTripId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="" disabled>-- Select a Trip --</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900">
                  {t.name} ({t.destination})
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Ticket / Pass Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flight JL042: LHR ➔ HND"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Grid: Type & Traveler */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Pass Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Pass['type'])}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="flight" className="bg-slate-900">✈️ Flight</option>
                <option value="hotel" className="bg-slate-900">🏨 Hotel / Stay</option>
                <option value="train" className="bg-slate-900">🚄 Train</option>
                <option value="bus" className="bg-slate-900">🚌 Bus</option>
                <option value="restaurant" className="bg-slate-900">🍽️ Restaurant</option>
                <option value="activity" className="bg-slate-900">🎟️ Activity</option>
                <option value="other" className="bg-slate-900">📁 Other Doc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Assign Traveler
              </label>
              <select
                value={travelerId}
                onChange={(e) => setTravelerId(e.target.value as Pass['travelerId'])}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="tony" className="bg-slate-900">Tony</option>
                <option value="graeme" className="bg-slate-900">Graeme</option>
                <option value="shared" className="bg-slate-900">Both (Group)</option>
              </select>
            </div>
          </div>

          {/* Grid: Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Time (Optional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Location / Terminal / Platform *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Heathrow Terminal 3 / Platform 18"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Grid: Gate & Seat & Confirmation */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Gate / Zone
              </label>
              <input
                type="text"
                placeholder="e.g. A12"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="w-full px-2.5 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Seat / Room
              </label>
              <input
                type="text"
                placeholder="e.g. 24K"
                value={seat}
                onChange={(e) => setSeat(e.target.value)}
                className="w-full px-2.5 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Reference Code
              </label>
              <input
                type="text"
                placeholder="e.g. JAL92X"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full px-2.5 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Barcode Config */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-violet-400 font-mono">Digital Barcode / Scanner Config</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                  Barcode Type
                </label>
                <select
                  value={barcodeType}
                  onChange={(e) => setBarcodeType(e.target.value as Pass['barcodeType'])}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="none">No Barcode</option>
                  <option value="qr">QR Code (Standard)</option>
                  <option value="pdf417">PDF417 (Boarding Pass)</option>
                  <option value="aztec">Aztec (Train/Flight)</option>
                  <option value="code128">Code 128 (1D Barcode)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                  Barcode Content / Raw String
                </label>
                <input
                  type="text"
                  disabled={barcodeType === 'none'}
                  placeholder={barcodeType === 'none' ? 'No barcode selected' : 'Paste raw barcode payload'}
                  value={barcodeContent}
                  onChange={(e) => setBarcodeContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Attachment Upload Section */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-violet-400 font-mono">File Attachment (PDF / Image)</h4>
            
            {/* Existing Attachment */}
            {existingAttachment && (
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="truncate max-w-[220px] font-semibold">{existingAttachment.fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveExistingAttachment}
                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
                  title="Remove attachment"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* File Selector */}
            {!existingAttachment && (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border border-dashed border-white/15 rounded-xl p-5 text-center flex flex-col items-center justify-center hover:border-violet-500/40 hover:bg-violet-600/5 transition">
                  {selectedFile ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-200 truncate max-w-[280px]">
                        {selectedFile.name}
                      </p>
                      <span className="text-[9px] text-slate-500 font-mono uppercase mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-300">Upload PDF or Ticket Image</p>
                      <p className="text-[10px] text-slate-500 mt-1">Supports PDF, PNG, JPG (saved offline)</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Trip Notes / Reminders
            </label>
            <textarea
              placeholder="e.g. gates close 30 minutes early; carry-on only"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          {/* Submit Actions */}
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
              {pass ? 'Save Ticket' : 'Add Ticket'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
