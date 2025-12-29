import React, { useEffect, useRef } from 'react';
import AudioEngine from '../engine/AudioEngine';

interface VisualizerProps {
  engine: AudioEngine | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!engine || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = engine.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      // Create gradient for Dark Theme
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(255, 140, 0, 0.1)'); // Dark Orange
      gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)'); // Orange
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0.8)'); // Gold

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < bufferLength; i++) {
        // Curve smoothing
        const barHeight = (dataArray[i] / 255) * height;
        ctx.lineTo(x, height - barHeight);
        x += barWidth;
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [engine]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={80} 
      className="w-full h-full rounded-lg opacity-80"
    />
  );
};

export default Visualizer;