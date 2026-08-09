import React, { useState } from 'react';
import { db, type Attachment } from '../db';
import { X, Download, Upload, Clipboard, Check, RefreshCw } from 'lucide-react';

interface SyncModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ onClose, onImportComplete }) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Helper: Convert Blob to Base64 Data URL for JSON serialization
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper: Convert Base64 Data URL back to Blob
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Export database to JSON file
  const handleExport = async () => {
    setLoading(true);
    setStatus('Preparing export bundle...');
    try {
      const trips = await db.trips.toArray();
      const passes = await db.passes.toArray();
      const profiles = await db.profiles.toArray();
      const rawAttachments = await db.attachments.toArray();

      // Convert attachments blobs to base64
      setStatus('Encoding attachments (this may take a few seconds)...');
      const attachments = await Promise.all(
        rawAttachments.map(async (att) => ({
          id: att.id,
          fileName: att.fileName,
          fileType: att.fileType,
          dataUrl: await blobToBase64(att.data),
        }))
      );

      const exportBundle = {
        app: 'waypoint',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          trips,
          passes,
          profiles,
          attachments,
        },
      };

      const jsonStr = JSON.stringify(exportBundle, null, 2);
      
      // Download as file
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `waypoint-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus('Backup downloaded successfully.');
    } catch (err: any) {
      console.error('Export failed:', err);
      setStatus(`Export failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Copy JSON backup string to clipboard
  const handleCopyToClipboard = async () => {
    setLoading(true);
    try {
      const trips = await db.trips.toArray();
      const passes = await db.passes.toArray();
      const profiles = await db.profiles.toArray();
      const rawAttachments = await db.attachments.toArray();

      const attachments = await Promise.all(
        rawAttachments.map(async (att) => ({
          id: att.id,
          fileName: att.fileName,
          fileType: att.fileType,
          dataUrl: await blobToBase64(att.data),
        }))
      );

      const bundle = {
        app: 'waypoint',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: { trips, passes, profiles, attachments },
      };

      await navigator.clipboard.writeText(JSON.stringify(bundle));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setStatus('Backup copied to clipboard!');
    } catch (err: any) {
      console.error('Copy failed:', err);
      setStatus(`Copy failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Import JSON backup data
  const handleImport = async (jsonString: string) => {
    if (!jsonString.trim()) {
      alert('Please paste a backup JSON string or upload a file.');
      return;
    }

    setLoading(true);
    setStatus('Parsing backup file...');
    try {
      const bundle = JSON.parse(jsonString);
      
      // Basic validation
      if (bundle.app !== 'waypoint' || !bundle.data) {
        throw new Error('Invalid file format. This is not a Waypoint backup.');
      }

      const { trips, passes, profiles, attachments } = bundle.data;

      if (!Array.isArray(trips) || !Array.isArray(passes)) {
        throw new Error('Corrupted backup structure.');
      }

      await db.transaction('rw', [db.trips, db.passes, db.profiles, db.attachments], async () => {
        setStatus('Clearing current local database...');
        // Clear current tables to avoid conflicts
        await db.trips.clear();
        await db.passes.clear();
        await db.profiles.clear();
        await db.attachments.clear();

        setStatus('Restoring profiles & trips...');
        if (profiles && Array.isArray(profiles)) {
          await db.profiles.bulkAdd(profiles);
        }
        await db.trips.bulkAdd(trips);
        await db.passes.bulkAdd(passes);

        setStatus('Restoring attachments (converting binary blobs)...');
        if (attachments && Array.isArray(attachments)) {
          const decodedAttachments: Attachment[] = attachments.map((att: any) => ({
            id: att.id,
            fileName: att.fileName,
            fileType: att.fileType,
            data: dataURLtoBlob(att.dataUrl),
          }));
          await db.attachments.bulkAdd(decodedAttachments);
        }
      });

      setStatus('Import completed successfully!');
      alert('Data imported successfully! The page will now reload.');
      onImportComplete();
      onClose();
    } catch (err: any) {
      console.error('Import failed:', err);
      setStatus(`Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle uploaded JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleImport(event.target.result as string);
        }
      };
      reader.onerror = () => {
        setStatus('Error reading uploaded file.');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-950/40">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Backup & Sync Data</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Local-first Data Portability</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Status Bar */}
          {status && (
            <div className="p-3 bg-violet-950/40 border border-violet-500/20 text-violet-300 text-xs rounded-xl text-center font-mono">
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin inline mr-2 text-violet-400" />}
              {status}
            </div>
          )}

          {/* Export Actions */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 font-mono">Export Backup</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Download your trips, boarding passes, and ticket files as a single JSON file. You can store it on iCloud, Google Drive, or transfer it to another device.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                disabled={loading}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-violet-400" />
                Download JSON
              </button>

              <button
                onClick={handleCopyToClipboard}
                disabled={loading}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="w-4 h-4 text-violet-400" />
                    Copy JSON Code
                  </>
                )}
              </button>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Import Actions */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 font-mono">Import Backup / Restore</h4>
            <p className="text-xs text-slate-400 leading-normal">
              <span className="text-amber-400 font-semibold">Warning:</span> Restoring a backup will overwrite all current local data on this device.
            </p>

            {/* File Upload Selector */}
            <div className="relative">
              <input
                type="file"
                accept=".json"
                disabled={loading}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border border-dashed border-white/10 hover:border-violet-500/40 rounded-xl p-5 text-center flex flex-col items-center justify-center bg-slate-950/20 hover:bg-violet-600/5 transition">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-300">Upload Backup JSON File</p>
                <p className="text-[10px] text-slate-500 mt-1">Select a previously exported .json file</p>
              </div>
            </div>

            {/* Raw JSON Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Or Paste JSON String
              </label>
              <textarea
                placeholder='Paste raw {"app": "waypoint", ...} JSON data here'
                rows={4}
                value={importText}
                disabled={loading}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl text-slate-300 text-xs font-mono focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
              <button
                onClick={() => handleImport(importText)}
                disabled={loading || !importText.trim()}
                className="w-full py-3 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
              >
                Restore JSON Data
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
