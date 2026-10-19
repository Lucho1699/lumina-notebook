import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DrawingStroke, DrawingPoint } from '../../types/notebook';
import { soundEngine } from '../../utils/soundEngine';

interface InkingCanvasProps {
  pageId: string;
  drawings: DrawingStroke[];
  activeTool: 'select' | 'pen' | 'highlighter' | 'eraser';
  penColor: string;
  penWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
  onUpdateDrawings: (strokes: DrawingStroke[]) => void;
  isCurrentPage: boolean;
}

// Normalized virtual coordinate system base
const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 1000;

export const InkingCanvas: React.FC<InkingCanvasProps> = ({
  drawings,
  activeTool,
  penColor,
  penWidth,
  highlighterColor,
  highlighterWidth,
  onUpdateDrawings,
  isCurrentPage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);

  // Redraw all strokes onto canvas using virtual coordinate scaling
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get actual backing resolution
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }

    ctx.save();
    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale from virtual coordinates (800x1000) to device pixel canvas
    const scaleX = canvas.width / VIRTUAL_WIDTH;
    const scaleY = canvas.height / VIRTUAL_HEIGHT;
    ctx.scale(scaleX, scaleY);

    const allStrokes = currentStroke ? [...drawings, currentStroke] : drawings;

    // Render strokes
    allStrokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;

      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.38;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      } else if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = stroke.width;
      } else {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      }

      const p0 = stroke.points[0];
      ctx.moveTo(p0.x, p0.y);

      if (stroke.points.length === 1) {
        // Draw dot
        ctx.lineTo(p0.x + 0.1, p0.y + 0.1);
      } else if (stroke.points.length === 2) {
        ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
      } else {
        // Smooth quadratic bezier curves
        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.x, last.y);
      }

      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }, [drawings, currentStroke]);

  // Adjust canvas resolution dynamically on container resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      redrawCanvas();
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Map client pointer coordinates into virtual coordinate space (800 x 1000)
  const getVirtualCoords = (e: React.PointerEvent<HTMLCanvasElement>): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VIRTUAL_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
    return {
      x: Math.max(0, Math.min(VIRTUAL_WIDTH, x)),
      y: Math.max(0, Math.min(VIRTUAL_HEIGHT, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select' || !isCurrentPage) return;
    e.preventDefault();

    const coords = getVirtualCoords(e);
    setIsDrawing(true);

    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tool: activeTool === 'highlighter' ? 'highlighter' : activeTool === 'eraser' ? 'eraser' : 'pen',
      color: activeTool === 'highlighter' ? highlighterColor : penColor,
      width: activeTool === 'highlighter' ? highlighterWidth : activeTool === 'eraser' ? 24 : penWidth,
      points: [coords],
    };

    setCurrentStroke(newStroke);
    soundEngine.playPenStroke();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || activeTool === 'select') return;
    e.preventDefault();

    const coords = getVirtualCoords(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, coords],
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDrawing(false);

    if (currentStroke.points.length > 0) {
      onUpdateDrawings([...drawings, currentStroke]);
    }
    setCurrentStroke(null);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-20 w-full h-full ${
        activeTool === 'select'
          ? 'pointer-events-none'
          : activeTool === 'eraser'
          ? 'cursor-cell pointer-events-auto touch-none'
          : 'cursor-crosshair pointer-events-auto touch-none'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
};
