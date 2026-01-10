import React from 'react';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="glass-panel p-10 rounded-[30px] max-w-md w-[90%] relative flex flex-col items-center text-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 transform transition-all">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all border border-transparent hover:border-white/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8 relative">
            <div className="absolute inset-0 bg-orange-500 blur-[40px] opacity-20 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white tracking-[0.2em] relative z-10">AETHERIA</h2>
            <p className="text-orange-400/80 font-mono text-[10px] tracking-[0.5em] uppercase mt-2 relative z-10">Glass Synth Engine</p>
        </div>

        <div className="space-y-6 w-full relative z-10">
           <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
             <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Developed By</span>
             <span className="text-xl font-light text-white tracking-wide">Matthew Robert Wesney</span>
           </div>

           <div className="flex flex-col gap-3 w-full">
              <a href="https://matt-wesney.github.io/website/" target="_blank" rel="noreferrer" className="glass-btn py-3 px-5 rounded-xl flex items-center justify-between group no-underline">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white tracking-wide">Portfolio</span>
                 </div>
                 <span className="text-[10px] font-mono text-white/30 group-hover:text-blue-300 transition-colors">dovvnloading.github.io</span>
              </a>
              
              <a href="https://github.com/dovvnloading" target="_blank" rel="noreferrer" className="glass-btn py-3 px-5 rounded-xl flex items-center justify-between group no-underline">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white tracking-wide">GitHub</span>
                 </div>
                 <span className="text-[10px] font-mono text-white/30 group-hover:text-purple-300 transition-colors">github.com/dovvnloading</span>
              </a>

              <a href="https://x.com/D3VAUX" target="_blank" rel="noreferrer" className="glass-btn py-3 px-5 rounded-xl flex items-center justify-between group no-underline">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white tracking-wide">X / Twitter</span>
                 </div>
                 <span className="text-[10px] font-mono text-white/30 group-hover:text-white transition-colors">@D3VAUX</span>
              </a>
           </div>
        </div>

        <div className="mt-8 pt-6 w-full flex flex-col items-center gap-2">
           <div className="w-8 h-[2px] bg-white/10 rounded-full mb-2"></div>
           <p className="text-[9px] text-white/20 text-center leading-relaxed font-mono uppercase tracking-widest">
             Generative Audio Architecture v1.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
