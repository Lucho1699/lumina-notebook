import { describe, it, expect } from 'vitest';

describe('3D Book Container Navigation & Drag Physics Math', () => {
  it('correctly calculates dual-page normalized indices for even/odd spreads', () => {
    const normalize = (index: number) => Math.floor(index / 2) * 2;

    expect(normalize(0)).toBe(0);
    expect(normalize(1)).toBe(0);
    expect(normalize(2)).toBe(2);
    expect(normalize(3)).toBe(2);
    expect(normalize(4)).toBe(4);
  });

  it('determines whether forward and backward flips are allowed', () => {
    const totalPages = 5;

    const canGoPrev = (current: number) => current > 0;
    const canGoNextDual = (normalized: number) => normalized + 2 < totalPages || normalized + 1 < totalPages;

    expect(canGoPrev(0)).toBe(false);
    expect(canGoPrev(1)).toBe(true);
    expect(canGoNextDual(0)).toBe(true);
    expect(canGoNextDual(4)).toBe(false);
  });

  it('calculates drag rotation angle and dynamic shadow opacity correctly', () => {
    const halfWidth = 400; // px
    const deltaX = -200; // dragged 200px to left
    const progress = Math.max(0, Math.min(1, -deltaX / halfWidth));
    const angle = -progress * 180;
    const shadowOpacity = Math.sin(progress * Math.PI) * 0.45;

    expect(progress).toBe(0.5);
    expect(angle).toBe(-90);
    expect(shadowOpacity).toBeCloseTo(0.45, 2);
  });

  it('correctly triggers page flip when drag exceeds threshold', () => {
    const halfWidth = 400;
    const dragThreshold = Math.min(100, halfWidth * 0.22); // 88px

    const drag1 = -50;
    const drag2 = -95;

    expect(drag1 < -dragThreshold).toBe(false);
    expect(drag2 < -dragThreshold).toBe(true);
  });
});
