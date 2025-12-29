import React from 'react';
import { NOTE_TO_FREQUENCY } from '../constants';

interface KeyboardProps {
  activeNotes: Set<string>;
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ activeNotes, onNoteOn, onNoteOff }) => {
  const keys: { note: string; isBlack: boolean; offset: number }[] = [];
  
  const startOctave = 3;
  const endOctave = 5;
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  let whiteKeyIndex = 0;

  for (let oct = startOctave; oct <= endOctave; oct++) {
    notes.forEach((n) => {
      if (oct === endOctave && n !== 'C') return;
      
      const isBlack = n.includes('#');
      const noteName = `${n}${oct}`;
      
      keys.push({
        note: noteName,
        isBlack,
        offset: isBlack ? whiteKeyIndex - 0.5 : whiteKeyIndex++
      });
    });
  }

  const whiteKeyWidth = 40;
  const blackKeyWidth = 24;
  const totalWidth = whiteKeyIndex * whiteKeyWidth;

  return (
    <div className="relative h-32 mt-4 overflow-hidden rounded-b-2xl select-none" style={{ width: totalWidth, margin: '0 auto' }}>
      {keys.map((k) => {
        const isActive = activeNotes.has(k.note);
        
        if (k.isBlack) {
            return null; 
        }
        
        return (
          <div
            key={k.note}
            className={`absolute top-0 h-full border-r border-white/10 rounded-b-md transition-all duration-100 cursor-pointer
              ${isActive 
                  ? 'bg-orange-500/80 shadow-[0_0_15px_rgba(255,165,0,0.5)] translate-y-1' 
                  : 'bg-white/90 hover:bg-white'}
              active:scale-[0.98] origin-top
            `}
            style={{ 
                left: k.offset * whiteKeyWidth, 
                width: whiteKeyWidth,
                boxShadow: isActive ? 'inset 0 0 10px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.3)'
            }}
            onMouseDown={() => onNoteOn(k.note)}
            onMouseUp={() => onNoteOff(k.note)}
            onMouseLeave={() => onNoteOff(k.note)}
          >
             <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold ${isActive ? 'text-white' : 'text-black/30'}`}>{k.note}</div>
          </div>
        );
      })}

      {/* Render Black Keys on top */}
      {keys.filter(k => k.isBlack).map((k) => {
        const isActive = activeNotes.has(k.note);
         return (
          <div
            key={k.note}
            className={`absolute top-0 h-20 rounded-b-md transition-all duration-75 z-10 cursor-pointer border border-white/5
              ${isActive 
                  ? 'bg-orange-700 translate-y-1 shadow-[0_0_10px_rgba(255,69,0,0.5)]' 
                  : 'bg-black hover:bg-gray-900'}
            `}
            style={{ 
                left: (k.offset + 0.5) * whiteKeyWidth + (whiteKeyWidth - blackKeyWidth)/2,
                width: blackKeyWidth,
                boxShadow: isActive ? 'none' : '2px 4px 8px rgba(0,0,0,0.6)'
            }}
            onMouseDown={() => onNoteOn(k.note)}
            onMouseUp={() => onNoteOff(k.note)}
            onMouseLeave={() => onNoteOff(k.note)}
          />
        );
      })}
    </div>
  );
};

export default Keyboard;