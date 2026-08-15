import React, { useState, useEffect } from 'react';
import { type Pass, db, type Attachment } from '../db';
import { getPassTypeDisplayName, normalizePassType } from '../passTypes';
import { getSmartMapsUrl, getMapsServiceName } from '../maps';
import { BarcodeRenderer } from './BarcodeRenderer';
import { X, Maximize2, ShieldAlert, FileText, Download, Eye, MapPin, ExternalLink, Globe } from 'lucide-react';

interface PassDetailsModalProps {
  pass: Pass;
  onClose: () => void;
}

export const PassDetailsModal: React.FC<PassDetailsModalProps> = ({
  pass,
  onClose,
}) => {
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [isGateMode, setIsGateMode] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Load attachment from IndexedDB if pass references one
  useEffect(() => {
    let activeUrl: string | null = null;

    const loadAttachment = async () => {
      if (pass.attachmentId) {
        try {
          const record = await db.attachments.get(pass.attachmentId);
          if (record) {
            setAttachment(record);
            const url = URL.createObjectURL(record.data);
            activeUrl = url;
            setAttachmentUrl(url);
          }
        } catch (err) {
          console.error('Failed to load attachment:', err);
        }
      } else {
        setAttachment(null);
        setAttachmentUrl(null);
      }
    };

    loadAttachment();

    // Clean up temporary Object URL to prevent memory leaks
    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [pass.attachmentId]);

  // Request Wake Lock in Gate Mode (if browser supports it) to keep screen on at the gate
  useEffect(() => {
    let activeLock: any = null;

    const requestLock = async () => {
      if (activeLock) return;
      try {
        if ('wakeLock' in navigator) {
          activeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Screen Wake Lock is not available or blocked:', err);
      }
    };

    const releaseLock = async () => {
      if (activeLock) {
        try {
          await activeLock.release();
        } catch {}
        activeLock = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isGateMode) {
        requestLock();
      } else {
        releaseLock();
      }
    };

    if (isGateMode) {
      requestLock();
      document.addEventListener('visibilitychange', handleVisibility);
    } else {
      releaseLock();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (activeLock) {
        activeLock.release().catch(() => {});
      }
    };
  }, [isGateMode]);


  const getPassTypeName = () => {
    return getPassTypeDisplayName(pass.type);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getModalStyle = () => {
    switch (normalizePassType(pass.type)) {
      case 'flight':
        return {
          containerBg: 'bg-gradient-to-br from-blue-700 via-sky-850 to-indigo-900 text-white border-sky-400/30',
          headerBg: 'border-b border-white/10 bg-black/10',
          titleText: 'text-white',
          subtitleText: 'text-sky-200 opacity-80',
          labelText: 'text-sky-200/70',
          valueText: 'text-white',
          cardBg: 'bg-black/15 border border-white/5',
          btnClass: 'text-white/70 hover:text-white hover:bg-white/10',
          deleteBtnClass: 'text-red-300 hover:text-red-200 hover:bg-red-500/20'
        };
      case 'train':
      case 'bus':
        return {
          containerBg: 'bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 text-slate-950 border-amber-300/30',
          headerBg: 'border-b border-black/10 bg-black/5',
          titleText: 'text-slate-950 font-black',
          subtitleText: 'text-slate-800 font-bold',
          labelText: 'text-slate-800/80 font-bold',
          valueText: 'text-slate-950 font-extrabold',
          cardBg: 'bg-black/5 border border-black/5',
          btnClass: 'text-slate-950/70 hover:text-slate-950 hover:bg-black/10',
          deleteBtnClass: 'text-red-800 hover:text-red-900 hover:bg-red-500/20'
        };
      case 'hotel':
        return {
          containerBg: 'bg-gradient-to-br from-emerald-600 via-emerald-750 to-teal-850 text-white border-emerald-450/30 border-l-4 border-l-emerald-500',
          headerBg: 'border-b border-white/10 bg-black/10',
          titleText: 'text-white font-extrabold',
          subtitleText: 'text-emerald-100 font-bold',
          labelText: 'text-emerald-100/70',
          valueText: 'text-white',
          cardBg: 'bg-black/15 border border-white/5',
          btnClass: 'text-white/70 hover:text-white hover:bg-white/10',
          deleteBtnClass: 'text-red-300 hover:text-red-200 hover:bg-red-500/20'
        };
      case 'restaurant':
        return {
          containerBg: 'bg-gradient-to-br from-rose-900 via-rose-950 to-red-950 text-white border-rose-500/20',
          headerBg: 'border-b border-white/10 bg-black/10',
          titleText: 'text-white font-bold',
          subtitleText: 'text-rose-200',
          labelText: 'text-rose-200/70',
          valueText: 'text-white',
          cardBg: 'bg-black/15 border border-white/5',
          btnClass: 'text-white/70 hover:text-white hover:bg-white/10',
          deleteBtnClass: 'text-red-300 hover:text-red-200 hover:bg-red-500/20'
        };
      case 'activity':
        return {
          containerBg: 'bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-950 border-white/60 shadow-2xl',
          headerBg: 'border-b border-black/10 bg-black/5',
          titleText: 'text-slate-950 font-black',
          subtitleText: 'text-slate-700 font-bold',
          labelText: 'text-slate-600/90 font-bold',
          valueText: 'text-slate-950 font-extrabold',
          cardBg: 'bg-black/5 border border-black/10',
          btnClass: 'text-slate-900 hover:text-black hover:bg-black/10',
          deleteBtnClass: 'text-red-700 hover:text-red-900 hover:bg-red-500/20'
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
          deleteBtnClass: 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
        };
    }
  };

  const modalStyle = getModalStyle();

  return (
    <>
      {/* GATE MODE OVERLAY (Pure White, Full Screen, Large Barcode, Sleep Prevention) */}
      {isGateMode && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between px-6 py-8 md:p-8 select-none animate-in fade-in duration-200 overflow-y-auto">
          <div className="text-center w-full max-w-sm mt-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-sans block mb-1">
              Gate Mode Active
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight truncate">
              {pass.title}
            </h3>
            {pass.confirmationCode && (
              <p className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full inline-block mt-2 font-semibold">
                Ref: {pass.confirmationCode}
              </p>
            )}
          </div>

          {/* Centered High-Contrast Barcode */}
          <div className="flex-1 flex flex-col justify-center items-center w-full my-6 min-h-0">
            {pass.barcodeType !== 'none' && pass.barcodeContent ? (
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center max-w-full overflow-hidden">
                <BarcodeRenderer
                  type={pass.barcodeType}
                  content={pass.barcodeContent}
                  isGateMode={true}
                  className="bg-white border-0 shadow-none p-0"
                />
              </div>
            ) : (
              <div className="text-center p-6 text-slate-400">
                <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-semibold">No digital barcode configured</p>
              </div>
            )}

            {/* Quick-reference flight info for Gate officer */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 text-center text-slate-900 border-t border-slate-200 pt-4 w-full max-w-xs font-mono">
              {pass.seat && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Seat</span>
                  <span className="text-lg font-bold">{pass.seat}</span>
                </div>
              )}
              {pass.gate && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans">Gate</span>
                  <span className="text-lg font-bold">{pass.gate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action to Dismiss */}
          <button
            onClick={() => setIsGateMode(false)}
            className="w-full max-w-xs py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold shadow-lg text-sm transition-all active:scale-95 mb-2"
          >
            Exit Gate Mode
          </button>
        </div>
      )}

      {/* STANDARD DETAILS MODAL */}
      <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        {/* Background Click Handler */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Container */}
        <div className={`relative w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300 ${modalStyle.containerBg}`}>
          
          {/* Header Row (Styled dynamically to match the ticket color theme) */}
          <div className={`flex items-center justify-between p-5 ${modalStyle.headerBg}`}>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider font-mono block mb-0.5 ${modalStyle.subtitleText}`}>
                {getPassTypeName()}
              </span>
              <h3 className={`text-lg font-bold line-clamp-1 ${modalStyle.titleText}`}>{pass.title}</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition ${modalStyle.btnClass}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/10">
            
            {/* 1. Dynamic Barcode & Gate Mode Activator */}
            {pass.barcodeType !== 'none' && pass.barcodeContent ? (
              <div className="relative group bg-white rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 overflow-hidden shadow-inner">
                <BarcodeRenderer
                  type={pass.barcodeType}
                  content={pass.barcodeContent}
                  className="w-full bg-transparent p-0 border-none shadow-none"
                />
                
                {/* Gate Mode Trigger Overlay Button */}
                <button
                  onClick={() => setIsGateMode(true)}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 shadow-md transition active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Activate Gate Mode (High Brightness)
                </button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${modalStyle.labelText} border-white/10`}>
                No digital barcode configured. Import an update JSON containing barcodeType and barcodeContent for this item.
              </div>
            )}

            {/* 2. Structured Metadata Grid */}
            <div className={`grid grid-cols-2 gap-4 p-4 rounded-2xl ${modalStyle.cardBg}`}>
              <div className="col-span-2">
                <span className={`text-[9px] uppercase block font-mono tracking-wider ${modalStyle.labelText}`}>Date</span>
                <span className={`text-sm font-bold ${modalStyle.valueText}`}>{formatDate(pass.date)}</span>
              </div>
              
              {pass.time && (
                <div>
                  <span className={`text-[9px] uppercase block font-mono tracking-wider ${modalStyle.labelText}`}>Scheduled Time</span>
                  <span className={`text-sm font-bold ${modalStyle.valueText}`}>{pass.time}</span>
                </div>
              )}

              {pass.confirmationCode && (
                <div>
                  <span className={`text-[9px] uppercase block font-mono tracking-wider ${modalStyle.labelText}`}>Confirmation Ref</span>
                  <span className={`text-sm font-mono font-bold select-all ${modalStyle.valueText}`}>{pass.confirmationCode}</span>
                </div>
              )}

              {pass.gate && (
                <div>
                  <span className={`text-[9px] uppercase block font-mono tracking-wider ${modalStyle.labelText}`}>Gate / Terminal</span>
                  <span className={`text-sm font-bold ${modalStyle.valueText}`}>{pass.gate}</span>
                </div>
              )}

              {pass.seat && (
                <div>
                  <span className={`text-[9px] uppercase block font-mono tracking-wider ${modalStyle.labelText}`}>Seat Assignment</span>
                  <span className={`text-sm font-bold ${modalStyle.valueText}`}>{pass.seat}</span>
                </div>
              )}

              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] uppercase block font-mono tracking-wider ${modalStyle.labelText}`}>Location</span>
                  {getSmartMapsUrl(pass.mapsUrl, pass.location) && (
                    <a
                      href={getSmartMapsUrl(pass.mapsUrl, pass.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${modalStyle.btnClass} bg-black/15 border-white/10`}
                      title={`Open in ${getMapsServiceName()}`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-violet-400" />
                      <span>{getMapsServiceName()}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
                <span className={`text-xs font-semibold block ${modalStyle.valueText}`}>{pass.location}</span>
              </div>

              {pass.website && (
                <div className="col-span-2">
                  <span className={`text-[9px] uppercase block font-mono tracking-wider mb-1 ${modalStyle.labelText}`}>Official Website</span>
                  <a
                    href={pass.website.startsWith('http') ? pass.website : `https://${pass.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${modalStyle.btnClass} bg-black/10 border-white/10 max-w-full truncate`}
                    title={pass.website}
                  >
                    <Globe className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="truncate">{pass.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                  </a>
                </div>
              )}

              <div>
                <span className={`text-[9px] uppercase block font-mono tracking-wider ${modalStyle.labelText}`}>Traveler</span>
                <span className={`text-xs capitalize font-bold ${modalStyle.valueText}`}>{!pass.travelerId || pass.travelerId === 'shared' ? 'Shared' : pass.travelerId}</span>
              </div>
            </div>

            {/* 3. Attachment Segment */}
            {attachment && attachmentUrl && (
              <div className="space-y-3">
                <h4 className={`text-xs uppercase font-bold tracking-wider font-mono ${modalStyle.labelText}`}>Attached Document</h4>
                
                <div className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${modalStyle.cardBg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${modalStyle.btnClass} bg-black/10`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate max-w-[200px] ${modalStyle.valueText}`} title={attachment.fileName}>
                        {attachment.fileName}
                      </p>
                      <p className={`text-[9px] uppercase font-mono ${modalStyle.labelText}`}>
                        {attachment.fileType.split('/')[1] || 'document'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {attachment.fileType.startsWith('image/') ? (
                      <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition bg-black/10 border border-black/10 ${modalStyle.btnClass}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPdfPreview(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition bg-black/10 border border-black/10 ${modalStyle.btnClass}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View PDF
                      </button>
                    )}
                    
                    <a
                      href={attachmentUrl}
                      download={attachment.fileName}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition bg-black/20 border border-black/15 ${modalStyle.btnClass}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </a>
                  </div>
                </div>

                {/* Render inline image attachment previews directly */}
                {attachment.fileType.startsWith('image/') && (
                  <div className={`rounded-2xl overflow-hidden max-h-60 flex justify-center p-2 border ${modalStyle.cardBg}`}>
                    <img
                      src={attachmentUrl}
                      alt="Attachment Preview"
                      className="max-w-full max-h-60 object-contain rounded-xl hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Inline PDF Preview Modal */}
            {showPdfPreview && attachment && attachmentUrl && (
              <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col p-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-4 text-slate-200">
                  <span className="text-sm font-semibold truncate max-w-[70%]">{attachment.fileName}</span>
                  <button
                    onClick={() => setShowPdfPreview(false)}
                    className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden bg-white">
                  <iframe
                    src={attachmentUrl}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}

            {/* 4. Notes Section */}
            {pass.notes && (
              <div className="space-y-2">
                <h4 className={`text-xs uppercase font-bold tracking-wider font-mono ${modalStyle.labelText}`}>Trip Planner Notes</h4>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap font-sans ${modalStyle.cardBg} ${modalStyle.valueText}`}>
                  {pass.notes}
                </div>
              </div>
            )}

          </div>

          {/* Close Action in Mobile Bottom */}
          <div className={`p-4 border-t block sm:hidden ${modalStyle.headerBg}`}>
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-bold text-sm transition bg-black/10 border border-black/10 ${modalStyle.btnClass}`}
            >
              Close Details
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
