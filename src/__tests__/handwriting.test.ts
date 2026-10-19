import { describe, it, expect, vi } from 'vitest';
import { recognizeHandwritingStrokes } from '../utils/handwritingRecognition';
import type { DrawingStroke } from '../types/notebook';

describe('Handwriting Recognition Utility', () => {
  it('rejects recognition when stroke list is empty', async () => {
    const res = await recognizeHandwritingStrokes([]);
    expect(res.success).toBe(false);
    expect(res.text).toBe('');
    expect(res.error).toContain('No hay trazos');
  });

  it('rejects recognition when strokes only contain eraser strokes', async () => {
    const strokes: DrawingStroke[] = [
      { id: '1', tool: 'eraser', color: '#000', width: 24, points: [{ x: 10, y: 10 }] },
    ];
    const res = await recognizeHandwritingStrokes(strokes);
    expect(res.success).toBe(false);
    expect(res.error).toContain('No hay trazos');
  });

  it('successfully converts valid ink strokes when API returns 200', async () => {
    const strokes: DrawingStroke[] = [
      {
        id: '1',
        tool: 'pen',
        color: '#2563eb',
        width: 4,
        points: [
          { x: 100, y: 100 },
          { x: 100, y: 200 },
        ],
      },
    ];

    const mockResponse = {
      success: true,
      text: 'Hola',
      candidates: ['Hola', 'hola', 'HOLA'],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const res = await recognizeHandwritingStrokes(strokes, 'es');
    expect(res.success).toBe(true);
    expect(res.text).toBe('Hola');
    expect(res.candidates).toContain('Hola');
  });

  it('gracefully handles server errors without crashing', async () => {
    const strokes: DrawingStroke[] = [
      {
        id: '1',
        tool: 'pen',
        color: '#2563eb',
        width: 4,
        points: [{ x: 50, y: 50 }],
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Fallo temporal en el servidor' }),
    });

    const res = await recognizeHandwritingStrokes(strokes);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Fallo temporal');
  });
});
