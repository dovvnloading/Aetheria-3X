import { SynthParams, NOTE_TO_FREQUENCY } from '../constants';

class AudioEngine {
  ctx: AudioContext;
  masterGain: GainNode;
  compressor: DynamicsCompressorNode;
  
  // FX Chain
  reverbNode: ConvolverNode;
  reverbGain: GainNode;
  dryGain: GainNode;
  
  delayNode: DelayNode;
  delayFeedback: GainNode;
  delayDry: GainNode;
  delayWet: GainNode;
  
  phaserFilters: BiquadFilterNode[] = [];
  phaserLFO: OscillatorNode;
  phaserGain: GainNode;
  
  analyser: AnalyserNode;

  activeVoices: Map<string, {
    oscs: OscillatorNode[];
    gains: GainNode[];
    mainGain: GainNode;
    filter: BiquadFilterNode;
    panner: StereoPannerNode;
  }> = new Map();

  params: SynthParams;

  constructor(params: SynthParams) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.params = params;

    // Master Chain
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12;
    this.compressor.ratio.value = 12;
    this.compressor.connect(this.ctx.destination);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.4; // Lower master gain to account for 3x oscillators
    this.masterGain.connect(this.compressor);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.compressor.connect(this.analyser); // Connect for visualizer

    // --- REVERB ---
    this.reverbNode = this.ctx.createConvolver();
    this.generateReverbImpulse(params.reverbDecay);
    this.reverbGain = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();
    
    // Mix
    this.reverbGain.connect(this.masterGain);
    this.dryGain.connect(this.masterGain);
    this.reverbNode.connect(this.reverbGain);

    // --- DELAY ---
    this.delayNode = this.ctx.createDelay(5.0);
    this.delayFeedback = this.ctx.createGain();
    this.delayDry = this.ctx.createGain();
    this.delayWet = this.ctx.createGain();

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);

    // Route Delay to Reverb inputs
    this.delayWet.connect(this.reverbNode);
    this.delayWet.connect(this.dryGain);
    this.delayDry.connect(this.reverbNode);
    this.delayDry.connect(this.dryGain);

    // --- PHASER ---
    // Simple 4-stage phaser
    const phaserStages = 4;
    for (let i = 0; i < phaserStages; i++) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'allpass';
        filter.frequency.value = 1000;
        this.phaserFilters.push(filter);
        if (i > 0) {
            this.phaserFilters[i-1].connect(filter);
        }
    }
    
    // LFO for Phaser
    this.phaserLFO = this.ctx.createOscillator();
    this.phaserLFO.type = 'sine';
    this.phaserLFO.frequency.value = params.phaseSpeed * 5; // 0-5Hz
    this.phaserGain = this.ctx.createGain();
    this.phaserGain.gain.value = 500; // Modulation depth
    
    this.phaserLFO.connect(this.phaserGain);
    this.phaserFilters.forEach(f => this.phaserGain.connect(f.frequency));
    this.phaserLFO.start();

    // The output of phaser goes to delay
    this.phaserFilters[phaserStages - 1].connect(this.delayNode);
    this.phaserFilters[phaserStages - 1].connect(this.delayDry);

    this.updateParams(params);
  }

  generateReverbImpulse(decayTime: number) {
    const rate = this.ctx.sampleRate;
    const length = rate * (decayTime * 3 + 0.1); // Scale decay
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        // Exponential decay noise
        const n = i;
        const decay = Math.pow(1 - (i / length), 5); // smoother tail
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
    }
    this.reverbNode.buffer = impulse;
  }

  updateParams(newParams: SynthParams) {
    this.params = newParams;

    // Delay
    const now = this.ctx.currentTime;
    this.delayNode.delayTime.setTargetAtTime(newParams.delayTime * 1.5 + 0.01, now, 0.1);
    this.delayFeedback.gain.setTargetAtTime(newParams.delayFeedback * 0.9, now, 0.1);
    this.delayWet.gain.setTargetAtTime(newParams.delayMix, now, 0.1);
    this.delayDry.gain.setTargetAtTime(1 - newParams.delayMix, now, 0.1);

    // Reverb
    this.reverbGain.gain.setTargetAtTime(newParams.reverbMix, now, 0.1);
    
    // Phaser
    this.phaserLFO.frequency.setTargetAtTime(newParams.phaseSpeed * 8, now, 0.1);
  }

  getOscType(val: number): OscillatorType {
    if (val < 0.25) return 'sawtooth';
    if (val < 0.50) return 'square';
    if (val < 0.75) return 'triangle';
    return 'sine';
  }

  triggerAttack(note: string) {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.activeVoices.has(note)) {
      this.triggerRelease(note); // Retrigger
    }

    const freq = NOTE_TO_FREQUENCY[note];
    if (!freq) return;

    const now = this.ctx.currentTime;
    
    // Voice Graph
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(0.4, now + this.params.attack + 0.01);

    const voiceFilter = this.ctx.createBiquadFilter();
    voiceFilter.type = 'lowpass';
    voiceFilter.frequency.setValueAtTime(this.params.cutoff * 10000 + 50, now);
    voiceFilter.Q.value = this.params.resonance * 15;

    // Drift / Chaos (Generative aspect)
    // Randomize filter slightly per note
    const drift = (Math.random() - 0.5) * this.params.drift * 2000;
    voiceFilter.frequency.linearRampToValueAtTime(Math.max(50, voiceFilter.frequency.value + drift), now + 1);

    const panner = this.ctx.createStereoPanner();
    // Random pan for unison effect feel
    panner.pan.value = (Math.random() - 0.5) * 0.2; 

    // Route: Oscs -> VoiceGain -> Filter -> Panner -> PhaserInput
    // Note: Swapped Gain and Filter order for typical subtractive synthesis flow (Osc -> Filter -> VCA), 
    // but here sticking to VCA -> Filter -> FX is also fine, or VCA after Filter.
    // Let's do: Oscs -> Filter -> VCA(voiceGain) -> Panner
    
    // Disconnect old route
    // Creating new route: Oscs -> Filter -> VoiceGain -> Panner -> Phaser
    
    voiceFilter.connect(voiceGain);
    voiceGain.connect(panner);
    panner.connect(this.phaserFilters[0]); // Start of phaser chain

    // Oscillators (Unison x 3 Layers)
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    
    const count = 1 + Math.floor(this.params.unison * 4); // 1 to 5 unison voices
    const spread = this.params.detune * 100; // cents

    for (let i = 0; i < count; i++) {
        // Calculate Unison Detune for this stack
        let unisonDetune = 0;
        if (count > 1) {
             unisonDetune = ((i / (count - 1)) - 0.5) * spread;
        }
        unisonDetune += (Math.random() - 0.5) * this.params.drift * 30; // Random drift

        // --- Layer 1 (Base) ---
        const o1 = this.ctx.createOscillator();
        o1.type = this.getOscType(this.params.osc1Wave);
        o1.frequency.value = freq;
        o1.detune.value = unisonDetune; 
        
        const g1 = this.ctx.createGain();
        g1.gain.value = this.params.osc1Level;
        
        o1.connect(g1);
        g1.connect(voiceFilter);
        o1.start(now);
        oscs.push(o1);
        gains.push(g1);

        // --- Layer 2 (Pitch Shifted) ---
        if (this.params.osc2Level > 0.01) {
            const o2 = this.ctx.createOscillator();
            o2.type = this.getOscType(this.params.osc2Wave);
            // Pitch math
            const pitchShift = Math.round(this.params.osc2Pitch);
            o2.frequency.value = freq * Math.pow(2, pitchShift / 12);
            o2.detune.value = unisonDetune + (Math.random() * 10 - 5); // Slight extra detune for fatness
            
            const g2 = this.ctx.createGain();
            g2.gain.value = this.params.osc2Level;
            
            o2.connect(g2);
            g2.connect(voiceFilter);
            o2.start(now);
            oscs.push(o2);
            gains.push(g2);
        }

        // --- Layer 3 (Pitch Shifted) ---
        if (this.params.osc3Level > 0.01) {
            const o3 = this.ctx.createOscillator();
            o3.type = this.getOscType(this.params.osc3Wave);
            const pitchShift = Math.round(this.params.osc3Pitch);
            o3.frequency.value = freq * Math.pow(2, pitchShift / 12);
            o3.detune.value = unisonDetune - (Math.random() * 10 - 5);
            
            const g3 = this.ctx.createGain();
            g3.gain.value = this.params.osc3Level;
            
            o3.connect(g3);
            g3.connect(voiceFilter);
            o3.start(now);
            oscs.push(o3);
            gains.push(g3);
        }
    }

    this.activeVoices.set(note, { oscs, gains, mainGain: voiceGain, filter: voiceFilter, panner });
  }

  triggerRelease(note: string) {
    const voice = this.activeVoices.get(note);
    if (!voice) return;

    const now = this.ctx.currentTime;
    const releaseTime = this.params.release + 0.01;

    // Ramp down main voice gain
    voice.mainGain.gain.cancelScheduledValues(now);
    voice.mainGain.gain.setValueAtTime(voice.mainGain.gain.value, now);
    voice.mainGain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

    voice.oscs.forEach(osc => {
        osc.stop(now + releaseTime + 0.1);
    });

    // Cleanup map
    this.activeVoices.delete(note);
    
    setTimeout(() => {
        voice.mainGain.disconnect();
        voice.filter.disconnect();
        voice.panner.disconnect();
        voice.gains.forEach(g => g.disconnect());
    }, (releaseTime + 1) * 1000);
  }
}

export default AudioEngine;