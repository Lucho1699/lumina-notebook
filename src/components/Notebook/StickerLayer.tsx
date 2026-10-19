import React, { useState } from 'react';
import type { StickerItem } from '../../types/notebook';
import { X, Move } from 'lucide-react';

interface StickerLayerProps {
  stickers: StickerItem[];
  onUpdateStickers: (stickers: StickerItem[]) => void;
  isInteractive: boolean;
}

const COLOR_MAP: Record<StickerItem['color'], { bg: string; text: string; border: string }> = {
  yellow: { bg: 'bg-amber-100', text: 'text-amber-950', border: 'border-amber-300' },
  pink: { bg: 'bg-rose-100', text: 'text-rose-950', border: 'border-rose-300' },
  blue: { bg: 'bg-sky-100', text: 'text-sky-950', border: 'border-sky-300' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-950', border: 'border-emerald-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-950', border: 'border-purple-300' },
};

export const StickerLayer: React.FC<StickerLayerProps> = ({
  stickers,
  onUpdateStickers,
  isInteractive,
}) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (!isInteractive) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setActiveDragId(id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent, id: string) => {
    if (activeDragId !== id) return;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const newX = ((e.clientX - parentRect.left - dragOffset.x) / parentRect.width) * 100;
    const newY = ((e.clientY - parentRect.top - dragOffset.y) / parentRect.height) * 100;

    const boundedX = Math.max(2, Math.min(78, newX));
    const boundedY = Math.max(2, Math.min(82, newY));

    onUpdateStickers(
      stickers.map((s) => (s.id === id ? { ...s, x: boundedX, y: boundedY } : s))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragId) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setActiveDragId(null);
    }
  };

  const handleTextChange = (id: string, newText: string) => {
    onUpdateStickers(
      stickers.map((s) => (s.id === id ? { ...s, text: newText } : s))
    );
  };

  const handleDelete = (id: string) => {
    onUpdateStickers(stickers.filter((s) => s.id !== id));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {stickers.map((stk) => {
        const theme = COLOR_MAP[stk.color] || COLOR_MAP.yellow;
        return (
          <div
            key={stk.id}
            style={{
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: `rotate(${stk.rotation}deg)`,
            }}
            className={`absolute w-44 md:w-52 p-3 shadow-lg rounded-sm border ${theme.bg} ${theme.border} pointer-events-auto transition-shadow hover:shadow-xl group select-none`}
            onPointerDown={(e) => handlePointerDown(e, stk.id)}
            onPointerMove={(e) => handlePointerMove(e, stk.id)}
            onPointerUp={handlePointerUp}
          >
            {/* Top pin / tape visual */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-amber-200/60 backdrop-blur-xs border border-amber-300/60 rotate-1 shadow-xs pointer-events-none" />

            <div className="flex items-center justify-between mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="cursor-grab active:cursor-grabbing text-slate-500">
                <Move className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(stk.id);
                }}
                className="p-0.5 rounded hover:bg-black/10 text-slate-700 transition-colors"
                title="Eliminar nota"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              value={stk.text}
              onChange={(e) => handleTextChange(stk.id, e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              className={`w-full bg-transparent resize-none outline-none font-['Caveat',cursive] text-base leading-tight ${theme.text} placeholder-slate-400`}
              rows={3}
              placeholder="Escribe tu nota..."
            />
          </div>
        );
      })}
    </div>
  );
};
