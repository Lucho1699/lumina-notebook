import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyserNode, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!isRecording) {
        // Flat calm line
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      if (analyserNode) {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        const barWidth = (width / 48) - 2;
        let x = 2;

        for (let i = 0; i < 48; i++) {
          const sampleIndex = Math.floor((i / 48) * (bufferLength / 2));
          const val = dataArray[sampleIndex] || 0;
          const barHeight = Math.max(4, (val / 255) * (height - 8));

          const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(0.5, '#ef4444');
          gradient.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, (height - barHeight) / 2, barWidth, barHeight, 3);
          ctx.fill();

          x += barWidth + 2;
        }
      } else {
        // Simulated lively wave if analyser not connected
        const time = Date.now() * 0.005;
        const barWidth = (width / 36) - 2;
        let x = 2;

        for (let i = 0; i < 36; i++) {
          const barHeight = Math.max(6, Math.sin(time + i * 0.4) * 18 + 24);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(x, (height - barHeight) / 2, barWidth, barHeight, 2);
          ctx.fill();
          x += barWidth + 2;
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserNode, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={70}
      className="w-full h-18 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner"
    />
  );
};
