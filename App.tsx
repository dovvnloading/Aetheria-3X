import React, { useState, useEffect, useCallback } from 'react';
import AudioEngine from './engine/AudioEngine';
import Knob from './components/Knob';
import Keyboard from './components/Keyboard';
import Visualizer from './components/Visualizer';
import InfoModal from './components/InfoModal';
import { DEFAULT_PARAMS, KEYBOARD_MAP, SynthParams } from './constants';

function App() {
  const [engine, setEngine] = useState<AudioEngine | null>(null);
  const [params, setParams] = useState<SynthParams>(DEFAULT_PARAMS);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Initialize engine on first interaction
  const initEngine = () => {
    if (!engine) {
      const newEngine = new AudioEngine(params);
      setEngine(newEngine);
      setIsReady(true);
    }
  };

  const updateParam = (key: keyof SynthParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    if (engine) engine.updateParams(newParams);
  };

  const randomize = () => {
    // Helper for random range
    const r = (min: number, max: number) => Math.random() * (max - min) + min;
    const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

    const newParams: SynthParams = {
      osc1Wave: Math.random(),
      osc1Level: r(0.4, 0.9),
      
      osc2Wave: Math.random(),
      osc2Level: r(0, 0.7),
      osc2Pitch: ri(-12, 24),
      
      osc3Wave: Math.random(),
      osc3Level: r(0, 0.7),
      osc3Pitch: ri(-24, 12),

      unison: r(0, 0.6),
      detune: r(0, 0.4),
      phaseMix: r(0, 0.6),
      phaseSpeed: r(0.05, 0.9),
      
      delayTime: r(0.1, 0.9),
      delayFeedback: r(0.1, 0.6),
      delayMix: r(0, 0.5),
      
      reverbMix: r(0.2, 0.7),
      reverbDecay: r(0.2, 0.95),
      
      attack: r(0.01, 0.6),
      release: r(0.1, 2.0),
      
      cutoff: r(0.1, 0.95),
      resonance: r(0.1, 0.8),
      drift: r(0.05, 0.3) // Always some drift for generative feel
    };
    
    setParams(newParams);
    if (engine) engine.updateParams(newParams);
  };

  const handleNoteOn = useCallback((note: string) => {
    if (!engine) return;
    engine.triggerAttack(note);
    setActiveNotes(prev => new Set(prev).add(note));
  }, [engine]);

  const handleNoteOff = useCallback((note: string) => {
    if (!engine) return;
    engine.triggerRelease(note);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  }, [engine]);

  // PC Keyboard Mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engine) return;
      if (e.repeat) return;
      
      const note = KEYBOARD_MAP[e.key.toLowerCase()];
      if (note) {
        handleNoteOn(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engine) return;
      const note = KEYBOARD_MAP[e.key.toLowerCase()];
      if (note) {
        handleNoteOff(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, handleNoteOn, handleNoteOff]);

  const getWaveLabel = (val: number) => {
      if (val < 0.25) return "SAW";
      if (val < 0.50) return "SQU";
      if (val < 0.75) return "TRI";
      return "SIN";
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Dynamic Background Orbs */}
      <div 
        className="absolute top-[-5%] left-[10%] w-[30vw] h-[30vw] rounded-full orb" 
        style={{ 
            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', 
            animationDelay: '0s',
            opacity: 0.6 
        }} 
      />
      <div 
        className="absolute bottom-[-10%] right-[5%] w-[40vw] h-[40vw] rounded-full orb" 
        style={{ 
            background: 'linear-gradient(135deg, #ff4e50, #f9d423)', 
            animationDelay: '-5s',
            opacity: 0.5 
        }} 
      />
      <div 
        className="absolute top-[20%] right-[25%] w-[15vw] h-[15vw] rounded-full orb" 
        style={{ 
            background: 'linear-gradient(135deg, #ffb347, #ffcc33)', 
            animationDelay: '-10s',
            opacity: 0.4 
        }} 
      />

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {!isReady ? (
        <div className="z-50 text-center flex flex-col items-center">
             <button 
              onClick={initEngine}
              className="glass-btn px-16 py-6 rounded-full text-xl font-light tracking-[0.3em] uppercase mb-8"
            >
              Initialize System
            </button>
            <p className="text-white/40 text-xs font-mono tracking-widest">AETHERIA AUDIO ENGINE</p>
            <p className="text-orange-400/30 text-[10px] font-mono mt-2">TRIPLE OSCILLATOR CORE</p>
        </div>
       
      ) : (
        <div className="glass-panel p-8 rounded-[30px] z-10 max-w-[1400px] w-[95%] mx-auto animate-in fade-in duration-700 flex flex-col shadow-2xl h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4 shrink-0">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-[0.1em] mb-1 drop-shadow-md">Aetheria <span className="text-orange-500 text-lg align-top">3X</span></h1>
              <div className="flex items-center gap-4">
                <p className="text-[10px] text-orange-200/60 font-mono tracking-[0.3em] uppercase">Generative Waveform Synthesis</p>
                <div className="h-4 w-[1px] bg-white/10"></div>
                <button 
                  onClick={randomize} 
                  className="glass-btn px-3 py-1 text-[9px] rounded uppercase tracking-widest hover:bg-orange-500/20 border-orange-500/30 text-orange-200 hover:text-white transition-all"
                  title="Generate new patch"
                >
                  Mutate
                </button>
                <button 
                  onClick={() => setShowInfo(true)} 
                  className="glass-btn px-3 py-1 text-[9px] rounded uppercase tracking-widest hover:bg-white/10 border-white/10 text-white/40 hover:text-white transition-all"
                  title="App Info"
                >
                  Info
                </button>
              </div>
            </div>
            <div className="w-80 h-12 bg-black/20 rounded-lg overflow-hidden border border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent"></div>
               <Visualizer engine={engine} />
            </div>
          </div>

          {/* Main Controls Container */}
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-2 custom-scrollbar">
            
            {/* TOP ROW: OSCILLATORS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* OSC 1 */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[10px] font-bold text-orange-100/70 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span> OSC 1
                        </h2>
                        <span className="text-[9px] font-mono text-white/40">{getWaveLabel(params.osc1Wave)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 place-items-center">
                        <Knob label="Shape" value={params.osc1Wave} onChange={(v) => updateParam('osc1Wave', v)} color="#ff9f43" />
                        <Knob label="Level" value={params.osc1Level} onChange={(v) => updateParam('osc1Level', v)} color="#ff9f43" />
                    </div>
                </div>

                {/* OSC 2 */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[10px] font-bold text-orange-100/70 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></span> OSC 2
                        </h2>
                         <div className="flex gap-2">
                             <span className="text-[9px] font-mono text-white/40">{Math.round(params.osc2Pitch)}st</span>
                             <span className="text-[9px] font-mono text-white/40">{getWaveLabel(params.osc2Wave)}</span>
                         </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 place-items-center">
                        <Knob label="Shape" value={params.osc2Wave} onChange={(v) => updateParam('osc2Wave', v)} color="#fda7df" />
                        <Knob label="Pitch" value={params.osc2Pitch} min={-24} max={24} onChange={(v) => updateParam('osc2Pitch', v)} color="#fda7df" />
                        <Knob label="Level" value={params.osc2Level} onChange={(v) => updateParam('osc2Level', v)} color="#fda7df" />
                    </div>
                </div>

                {/* OSC 3 */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[10px] font-bold text-orange-100/70 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-300 shadow-[0_0_8px_rgba(253,186,116,0.8)]"></span> OSC 3
                        </h2>
                        <div className="flex gap-2">
                             <span className="text-[9px] font-mono text-white/40">{Math.round(params.osc3Pitch)}st</span>
                             <span className="text-[9px] font-mono text-white/40">{getWaveLabel(params.osc3Wave)}</span>
                         </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 place-items-center">
                        <Knob label="Shape" value={params.osc3Wave} onChange={(v) => updateParam('osc3Wave', v)} color="#D980FA" />
                        <Knob label="Pitch" value={params.osc3Pitch} min={-24} max={24} onChange={(v) => updateParam('osc3Pitch', v)} color="#D980FA" />
                        <Knob label="Level" value={params.osc3Level} onChange={(v) => updateParam('osc3Level', v)} color="#D980FA" />
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: UNISON & FILTER & ENV */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
                 {/* SOURCE/UNISON */}
                <div className="space-y-4 p-2 pl-4">
                    <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                         Unison Engine
                    </h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        <Knob label="Unison" value={params.unison} onChange={(v) => updateParam('unison', v)} color="#f3a683" />
                        <Knob label="Detune" value={params.detune} onChange={(v) => updateParam('detune', v)} color="#f3a683" />
                    </div>
                </div>

                {/* FILTER */}
                <div className="space-y-4 p-2 border-l border-white/5 pl-4">
                    <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">VCF</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        <Knob label="Cutoff" value={params.cutoff} onChange={(v) => updateParam('cutoff', v)} color="#f7d794" />
                        <Knob label="Res" value={params.resonance} onChange={(v) => updateParam('resonance', v)} color="#f7d794" />
                    </div>
                </div>

                 {/* ENVELOPE */}
                 <div className="space-y-4 p-2 border-l border-white/5 pl-4">
                    <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Envelope</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        <Knob label="Attack" value={params.attack} onChange={(v) => updateParam('attack', v)} color="#f8a5c2" />
                        <Knob label="Release" value={params.release} onChange={(v) => updateParam('release', v)} color="#f8a5c2" />
                    </div>
                </div>

                 {/* MODULATION */}
                 <div className="space-y-4 p-2 border-l border-white/5 pl-4">
                    <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Phaser</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 items-center">
                        <Knob label="Rate" value={params.phaseSpeed} onChange={(v) => updateParam('phaseSpeed', v)} color="#63cdda" />
                        <div className="flex items-center justify-center opacity-40">
                             <div className="w-10 h-10 rounded-full border-2 border-dashed border-cyan-300 animate-spin shadow-[0_0_15px_rgba(34,211,238,0.4)]" style={{ animationDuration: `${(1-params.phaseSpeed)*5 + 0.2}s` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: CHAOS ENGINE */}
            <div className="mt-2">
                <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 ml-1 flex items-center gap-2">
                    Chaos
                </h2>
                
                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-0 border border-white/5 flex relative overflow-hidden h-32 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
                    {/* Background Subtle Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-teal-900/10 pointer-events-none"></div>

                    {/* Delay Side */}
                    <div className="flex-1 flex items-center justify-center gap-10 border-r border-white/5 relative">
                        {/* Vertical Label Box */}
                        <div className="w-14 h-20 bg-[#050505] rounded border border-white/5 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-[0.25em] -rotate-90 whitespace-nowrap group-hover:text-blue-400 transition-colors duration-300 cursor-default select-none">
                                DELAY
                            </span>
                        </div>

                        <div className="flex gap-8">
                            <Knob label="MIX" value={params.delayMix} onChange={(v) => updateParam('delayMix', v)} color="#60a5fa" />
                            <Knob label="FDBK" value={params.delayFeedback} onChange={(v) => updateParam('delayFeedback', v)} color="#60a5fa" />
                        </div>
                    </div>

                    {/* Reverb Side */}
                    <div className="flex-1 flex items-center justify-center gap-10">
                         {/* Vertical Label Box */}
                        <div className="w-14 h-20 bg-[#050505] rounded border border-white/5 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-[0.25em] -rotate-90 whitespace-nowrap group-hover:text-teal-400 transition-colors duration-300 cursor-default select-none">
                                REVERB
                            </span>
                        </div>

                        <div className="flex gap-8">
                            <Knob label="MIX" value={params.reverbMix} onChange={(v) => updateParam('reverbMix', v)} color="#2dd4bf" />
                            <Knob label="DECAY" value={params.reverbDecay} onChange={(v) => updateParam('reverbDecay', v)} color="#2dd4bf" />
                        </div>
                    </div>
                </div>
            </div>
            
          </div>

          {/* Keyboard Section */}
          <div className="mt-4 border-t border-white/5 pt-2 shrink-0">
             <Keyboard activeNotes={activeNotes} onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
          </div>

        </div>
      )}
    </div>
  );
}

export default App;