import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  color?: string;
}

const Knob: React.FC<KnobProps> = ({ label, value, min = 0, max = 1, onChange, color = "#ea580c" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  const startVal = useRef<number>(0);

  // Clamp value to ensure it stays within bounds
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);

  // Knob Rotation: -135deg (min) to +135deg (max)
  const rotation = -135 + percentage * 270;

  // SVG Geometry for the value ring
  // Radius = 24
  // Circumference (C) = 2 * PI * r = 2 * PI * 24 ≈ 150.796
  // Arc Length (270 degrees) = C * (270/360) = 150.796 * 0.75 ≈ 113.097
  const r = 24;
  const C = 2 * Math.PI * r;
  const arcLength = C * 0.75;
  
  // Dash Array format: "visible gap"
  // For the background track: Always show full arc length
  const dashArrayTrack = `${arcLength} ${C}`;
  
  // For the active value: Show percentage of arc length
  const dashArrayValue = `${percentage * arcLength} ${C}`;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startVal.current = clampedValue;
    e.preventDefault(); // Prevent text selection
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dy = startY.current - e.clientY;
      const range = max - min;
      const sensitivity = 0.005; // value per pixel
      let newVal = startVal.current + dy * sensitivity * range;
      newVal = Math.max(min, Math.min(max, newVal));
      onChange(newVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, max, min, onChange]);

  return (
    <div className="flex flex-col items-center gap-3 group select-none">
      <div 
        className="relative w-16 h-16 cursor-ns-resize touch-none"
        onMouseDown={handleMouseDown}
      >
        {/* 1. External Shadow Layer - Deep shadow for depth */}
        <div className="absolute inset-0 rounded-full shadow-[0_8px_16px_0_rgba(0,0,0,0.6)] z-0"></div>

        {/* 2. Glass Body - The Blur Layer */}
        {/* Simplified structure to ensure proper rounded masking */}
        <div className="absolute inset-0 rounded-full overflow-hidden z-10 bg-[#0a0a0a] border border-white/5">
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
        </div>
        
        {/* 3. Rotating Indicator */}
        <div 
          className="absolute inset-0 rounded-full z-20 pointer-events-none"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Dot Indicator */}
          <div 
            className="absolute top-[12%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]"
            style={{ boxShadow: `0 0 6px ${color}` }}
          ></div>
        </div>

        {/* 4. Center Cap / Indentation */}
        <div className="absolute inset-[25%] rounded-full bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-white/5 z-20 pointer-events-none"></div>
        
        {/* 5. Value Ring (SVG) */}
        {/* Rotated 135deg so the start of the stroke aligns with the 7:30 clock position (-135deg) */}
        <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-30 drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]"
            style={{ transform: 'rotate(135deg)' }}
        >
          {/* Track - Transparent white */}
          <circle 
            cx="50%" cy="50%" r={r} 
            stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none"
            strokeDasharray={dashArrayTrack}
            strokeLinecap="round"
          />
          {/* Active Value - Glowing color */}
          <circle 
            cx="50%" cy="50%" r={r} 
            stroke={color} strokeWidth="3" fill="none"
            strokeDasharray={dashArrayValue}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 2px ${color})` }}
          />
        </svg>
      </div>
      <div className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase pointer-events-none transition-colors group-hover:text-white/60">
        {label}
      </div>
    </div>
  );
};

export default Knob;