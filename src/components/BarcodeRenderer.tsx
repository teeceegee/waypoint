import React, { useEffect, useRef, useState } from 'react';
import bwipjs from 'bwip-js';

interface BarcodeRendererProps {
  type: 'aztec' | 'pdf417' | 'qr' | 'code128' | 'none';
  content: string;
  className?: string;
  isGateMode?: boolean;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  type,
  content,
  className = '',
  isGateMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'none' || !content) {
      setError('No barcode content specified');
      return;
    }

    setError(null);

    // Map database barcode type to bwip-js BCID format
    const typeMap: Record<string, string> = {
      qr: 'qrcode',
      aztec: 'azteccode',
      pdf417: 'pdf417',
      code128: 'code128',
    };

    const bcid = typeMap[type];
    if (!bcid) {
      setError(`Unsupported barcode type: ${type}`);
      return;
    }

    // Run barcode drawing inside a timeout to ensure canvas layout is stable
    const timer = setTimeout(() => {
      try {
        if (canvasRef.current) {
          // Configure options for optimal scanning
          const options: bwipjs.RenderOptions = {
            bcid,
            text: content,
            scale: isGateMode ? 4 : 3, // Upscale in Gate Mode for high precision
            includetext: false,       // Do not render text sub-labels to avoid external font loading errors
            backgroundcolor: 'FFFFFF', // Force solid white background behind barcode bars
          };

          // PDF417 benefits from setting an explicit height factor
          if (type === 'pdf417') {
            options.height = 12; // Bar height in mm
          }

          bwipjs.toCanvas(canvasRef.current, options);
        }
      } catch (err: any) {
        console.error('Failed to render barcode:', err);
        setError(err.message || 'Error rendering barcode');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [type, content, isGateMode]);

  if (type === 'none') {
    return null;
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 bg-white rounded-xl ${className}`}>
      {error ? (
        <div className="text-red-500 text-xs text-center py-6 font-mono max-w-[280px] break-all">
          <p>Barcode Rendering Failed</p>
          <span className="opacity-80 text-[10px]">{error}</span>
        </div>
      ) : (
        <div className="relative w-full flex justify-center overflow-x-auto no-scrollbar py-2">
          <canvas
            ref={canvasRef}
            className="max-w-full object-contain mix-blend-multiply"
            style={{
              imageRendering: 'pixelated', // Keep lines crisp and clear
            }}
          />
        </div>
      )}
      <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-2 font-mono break-all select-all select-none">
        {type} : {content.length > 25 ? `${content.substring(0, 22)}...` : content}
      </span>
    </div>
  );
};
