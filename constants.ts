export const KEYBOARD_MAP: Record<string, string> = {
  // Lower row (Z to M -> C3 to B3)
  'z': 'C3',
  's': 'C#3',
  'x': 'D3',
  'd': 'D#3',
  'c': 'E3',
  'v': 'F3',
  'g': 'F#3',
  'b': 'G3',
  'h': 'G#3',
  'n': 'A3',
  'j': 'A#3',
  'm': 'B3',
  ',': 'C4',
  'l': 'C#4',
  '.': 'D4',
  ';': 'D#4',
  '/': 'E4',

  // Upper row (Q to U -> C4 to B4+)
  'q': 'C4',
  '2': 'C#4',
  'w': 'D4',
  '3': 'D#4',
  'e': 'E4',
  'r': 'F4',
  '5': 'F#4',
  't': 'G4',
  '6': 'G#4',
  'y': 'A4',
  '7': 'A#4',
  'u': 'B4',
  'i': 'C5',
  '9': 'C#5',
  'o': 'D5',
  '0': 'D#5',
  'p': 'E5',
  '[': 'F5',
  '=': 'F#5',
  ']': 'G5',
};

export const NOTE_TO_FREQUENCY: Record<string, number> = {};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Generate frequencies
for (let octave = 0; octave <= 8; octave++) {
  NOTES.forEach((note, index) => {
    const noteName = `${note}${octave}`;
    // A4 is 440Hz. A4 is index 9 in octave 4.
    // MIDI note number calculation: (octave + 1) * 12 + index
    const semitonesFromA4 = ((octave - 4) * 12) + (index - 9);
    NOTE_TO_FREQUENCY[noteName] = 440 * Math.pow(2, semitonesFromA4 / 12);
  });
}

export type SynthParams = {
  // Oscillator 1
  osc1Wave: number; // 0-1 (Saw, Square, Tri, Sine)
  osc1Level: number; // 0-1
  
  // Oscillator 2
  osc2Wave: number;
  osc2Level: number;
  osc2Pitch: number; // -24 to +24 semitones
  
  // Oscillator 3
  osc3Wave: number;
  osc3Level: number;
  osc3Pitch: number; // -24 to +24 semitones

  unison: number; // 0 to 1
  detune: number; // 0 to 1
  phaseMix: number; // 0 to 1
  phaseSpeed: number; // 0 to 1
  delayTime: number; // 0 to 1
  delayFeedback: number; // 0 to 1
  delayMix: number; // 0 to 1
  reverbMix: number; // 0 to 1
  reverbDecay: number; // 0 to 1
  attack: number; // 0 to 1
  release: number; // 0 to 1
  cutoff: number; // 0 to 1
  resonance: number; // 0 to 1
  drift: number; // 0 to 1 (Generative chaos)
};

export const DEFAULT_PARAMS: SynthParams = {
  osc1Wave: 0.0, // Saw
  osc1Level: 0.8,
  
  osc2Wave: 0.3, // Square-ish
  osc2Level: 0.4,
  osc2Pitch: 12, // +1 Octave
  
  osc3Wave: 0.8, // Sine/Sub
  osc3Level: 0.6,
  osc3Pitch: -12, // -1 Octave

  unison: 0.2,
  detune: 0.15,
  phaseMix: 0.2,
  phaseSpeed: 0.1,
  delayTime: 0.4,
  delayFeedback: 0.3,
  delayMix: 0.2,
  reverbMix: 0.4,
  reverbDecay: 0.7,
  attack: 0.05,
  release: 0.4,
  cutoff: 0.6,
  resonance: 0.3,
  drift: 0.1,
};