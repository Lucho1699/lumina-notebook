import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { triggerHapticFeedback } from '../utils/haptics';

describe('Mobile App & PWA Features', () => {
  it('should have a valid PWA webmanifest in public directory', () => {
    const manifestPath = path.resolve(__dirname, '../../public/manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const parsed = JSON.parse(raw);

    expect(parsed.name).toBe('Lumina Notebook');
    expect(parsed.short_name).toBe('Lumina');
    expect(parsed.display).toBe('standalone');
    expect(parsed.icons.length).toBeGreaterThan(0);
  });

  it('should trigger haptic feedback gracefully without throwing', async () => {
    // Should run smoothly without throwing in test environment
    await expect(triggerHapticFeedback('light')).resolves.toBeUndefined();
    await expect(triggerHapticFeedback('medium')).resolves.toBeUndefined();
    await expect(triggerHapticFeedback('success')).resolves.toBeUndefined();
  });

  it('should verify Android native project structure exists', () => {
    const androidDir = path.resolve(__dirname, '../../android');
    const manifestPath = path.resolve(androidDir, 'app/src/main/AndroidManifest.xml');
    const gradlePath = path.resolve(androidDir, 'build.gradle');

    expect(fs.existsSync(androidDir)).toBe(true);
    expect(fs.existsSync(manifestPath)).toBe(true);
    expect(fs.existsSync(gradlePath)).toBe(true);

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    expect(manifestContent).toContain('android.permission.RECORD_AUDIO');
    expect(manifestContent).toContain('android.permission.CAMERA');
    expect(manifestContent).toContain('android.permission.VIBRATE');
  });
});
