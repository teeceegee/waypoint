import React from 'react';

interface OnboardingModalProps {
  onComplete: (owner: 'tony' | 'graeme') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md p-8 rounded-3xl glass text-center shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* iOS style phone icon */}
        <div className="w-16 h-16 mx-auto bg-violet-600/20 text-violet-400 rounded-2xl flex items-center justify-center mb-6 border border-violet-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <path d="M12 18h.01"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-2">Welcome to Waypoint</h2>
        <p className="text-slate-400 text-sm mb-8 px-2">
          Waypoint works offline. Let's customize this device. Who is the primary traveler using this iPhone?
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onComplete('tony')}
            className="flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-violet-600/20 hover:border-violet-500/40 active:scale-95 transition-all-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-violet-600/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-all-300 text-violet-300 font-bold text-lg">
              TO
            </div>
            <span className="text-sm font-semibold text-slate-200">Tony</span>
            <span className="text-[10px] text-slate-500 mt-1">Primary Owner</span>
          </button>

          <button
            onClick={() => onComplete('graeme')}
            className="flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-violet-600/20 hover:border-violet-500/40 active:scale-95 transition-all-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-violet-600/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-all-300 text-violet-300 font-bold text-lg">
              GR
            </div>
            <span className="text-sm font-semibold text-slate-200">Graeme</span>
            <span className="text-[10px] text-slate-500 mt-1">Primary Owner</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 italic">
          This choice sets the default profile for this phone. You will be able to switch profiles or view group tickets at any time.
        </p>

      </div>
    </div>
  );
};
