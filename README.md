# Aetheria 3X

> Live WebApp: https://dovvnloading.github.io/Aetheria-3X/

<img width="1551" height="841" alt="image" src="https://github.com/user-attachments/assets/8c08cc7e-2414-445c-9e94-264d61a353dd" />



![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-333333?style=for-the-badge&logo=w3c&logoColor=white)

Aetheria 3X is a browser-based, polyphonic subtractive synthesizer built with the native Web Audio API and React. It features a triple-oscillator architecture, a custom DSP effects chain, and a generative parameter randomization engine designed for creating evolving ambient textures and aggressive leads.

The application demonstrates high-performance audio graph management within a React functional component structure, utilizing a glassmorphic UI paradigm for real-time parameter control.

## Architecture & Audio Engine

The core audio logic is decoupled from the UI layer, residing in a dedicated `AudioEngine` class. This ensures low-latency audio scheduling independent of the React render cycle.

### Signal Path
1.  **Source:** 3x Oscillators (Saw/Square/Tri/Sine morphable) per voice.
2.  **Unison:** Dynamic voice stacking with stereo detuning and drift simulation.
3.  **Filter:** Resonant Low-Pass Filter (BiquadFilterNode) with envelope modulation.
4.  **Amplifier:** ADSR Envelope shaping via GainNodes.
5.  **Modulation:** 4-Stage All-Pass Filter Phaser with LFO rate control.
6.  **Spatial FX:** Stereo Delay with feedback loop -> Algorithmic Convolution Reverb.
7.  **Master:** Dynamics Compressor -> AnalyserNode -> Output.

### Key Features

*   **Generative Mutation:** The "Mutate" function randomizes synthesis parameters within musically constrained ranges, allowing for instant patch generation.
*   **Visual Feedback:** Real-time frequency analysis rendered via HTML5 Canvas.
*   **Polyphony:** Dynamic voice allocation with automatic release triggering and garbage collection.
*   **Responsive Controls:** Custom SVG-based rotary knobs with precise mouse-drag interaction.

## Installation and Development

To run the project locally, ensure you have Node.js installed.

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/aetheria-vst.git
    cd aetheria-vst
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Build for production:
    ```bash
    npm run build
    ```

## Usage Controls

### Audio Parameters
*   **OSC 1/2/3:** Controls waveform shape, pitch offset (semitones), and mix levels.
*   **VCF:** Filter cutoff frequency and resonance (Q).
*   **Envelope:** Attack and Release timing.
*   **Chaos Engine:** Controls for Delay feedback/mix and Reverb decay/mix.
*   **Phaser:** LFO rate modulation for the all-pass filter stages.

### Input
The synthesizer supports PC Keyboard input mapped to two octaves.

*   **Lower Octave:** Keys `Z` through `M` (C3 - B3)
*   **Upper Octave:** Keys `Q` through `U` (C4 - B4)
*   **Black Keys:** Mapped accordingly to the row above (e.g., `S`, `D`, `2`, `3`).

## Project Structure

```text
src/
├── components/        # React UI Components
│   ├── Knob.tsx       # SVG Rotary Control
│   ├── Keyboard.tsx   # Virtual Piano Interface
│   ├── Visualizer.tsx # Canvas Frequency Analyzer
│   └── ...
├── engine/            # Core DSP Logic
│   └── AudioEngine.ts # Web Audio API Graph & Voice Management
├── constants.ts       # Frequency maps and default patches
└── App.tsx            # Main state orchestration
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
