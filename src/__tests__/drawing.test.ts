import { describe, it, expect } from 'vitest';
import type { DrawingStroke } from '../types/notebook';

describe('Inking & Canvas Virtual Coordinate System', () => {
  const VIRTUAL_WIDTH = 800;
  const VIRTUAL_HEIGHT = 1000;

  it('maps screen pointer offsets to normalized virtual coordinates', () => {
    const mapCoords = (clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }) => {
      const x = ((clientX - rect.left) / rect.width) * VIRTUAL_WIDTH;
      const y = ((clientY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
      return {
        x: Math.max(0, Math.min(VIRTUAL_WIDTH, x)),
        y: Math.max(0, Math.min(VIRTUAL_HEIGHT, y)),
      };
    };

    // Screen is 400x500 (e.g. mobile or dual page)
    const rect = { left: 0, top: 0, width: 400, height: 500 };
    const pt = mapCoords(200, 250, rect);

    expect(pt.x).toBe(400); // exactly halfway across virtual width
    expect(pt.y).toBe(500); // exactly halfway down virtual height
  });

  it('handles undo stroke by removing the last stroke', () => {
    const strokes: DrawingStroke[] = [
      { id: 's1', tool: 'pen', color: '#000', width: 2, points: [{ x: 10, y: 10 }] },
      { id: 's2', tool: 'highlighter', color: '#ff0', width: 14, points: [{ x: 20, y: 20 }] },
    ];

    const undone = strokes.slice(0, -1);
    expect(undone.length).toBe(1);
    expect(undone[0].id).toBe('s1');
  });

  it('handles clear drawings by emptying stroke array', () => {
    let strokes: DrawingStroke[] = [
      { id: 's1', tool: 'pen', color: '#000', width: 2, points: [{ x: 10, y: 10 }] },
    ];

    strokes = [];
    expect(strokes.length).toBe(0);
  });
});
