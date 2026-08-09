import React, { useRef, useState } from 'react';
import { type Pass } from '../db';
import { PassCard } from './PassCard';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface GroupPassesCarouselProps {
  passes: Pass[];
  onSelectPass: (pass: Pass) => void;
}

export const GroupPassesCarousel: React.FC<GroupPassesCarouselProps> = ({
  passes,
  onSelectPass,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Group passes sorted chronologically (using date + time if available)
  const sortedPasses = [...passes].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= sortedPasses.length || !containerRef.current) return;
    
    const container = containerRef.current;
    const cardWidth = container.clientWidth; // Cards snap to viewport width
    
    container.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    
    setActiveIndex(index);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollPos = container.scrollLeft;
    const cardWidth = container.clientWidth;
    const rawIndex = scrollPos / cardWidth;
    const roundedIndex = Math.round(rawIndex);
    
    if (roundedIndex !== activeIndex && roundedIndex >= 0 && roundedIndex < sortedPasses.length) {
      setActiveIndex(roundedIndex);
    }
  };

  if (sortedPasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-slate-950/20 text-center">
        <Info className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-sm text-slate-400">No group tickets or passes found.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative py-4">
      {/* Navigation Indicators */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
          All Group Passes ({sortedPasses.length})
        </h3>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 border border-white/5 text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-750 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono font-bold text-violet-400 px-1">
            {activeIndex + 1} / {sortedPasses.length}
          </span>
          
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === sortedPasses.length - 1}
            className="p-1.5 rounded-lg bg-slate-800 border border-white/5 text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-750 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipeable Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar overscroll-contain-x w-full"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {sortedPasses.map((pass, index) => (
          <div
            key={pass.id || index}
            className="w-full flex-shrink-0 snap-center px-1"
          >
            <div className="transform transition-all duration-300">
              <PassCard
                pass={pass}
                onClick={() => onSelectPass(pass)}
              />
            </div>
            
            {/* Quick action helper: Click to zoom barcode */}
            {pass.barcodeType !== 'none' && (
              <p className="text-[10px] text-center text-slate-500 mt-2 font-mono italic">
                Tap card to scan / view barcode
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Visual Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {sortedPasses.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'bg-violet-500 w-4' : 'bg-slate-750'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
