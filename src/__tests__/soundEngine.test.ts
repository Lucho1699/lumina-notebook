import { describe, it, expect } from 'vitest';
import { soundEngine } from '../utils/soundEngine';

describe('Sound Engine Synthesizer', () => {
  it('allows enabling and disabling sound output', () => {
    soundEngine.enabled = true;
    expect(soundEngine.enabled).toBe(true);

    soundEngine.enabled = false;
    expect(soundEngine.enabled).toBe(false);
  });

  it('safely handles playPageFlip without crashing when AudioContext is mock or unavailable', () => {
    soundEngine.enabled = true;
    expect(() => {
      soundEngine.playPageFlip();
    }).not.toThrow();
  });

  it('safely handles tactile sounds without throwing errors', () => {
    expect(() => {
      soundEngine.playPenStroke();
      soundEngine.playStickerSound();
      soundEngine.playSuccessChime();
    }).not.toThrow();
  });
});
