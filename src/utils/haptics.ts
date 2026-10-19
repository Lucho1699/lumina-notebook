import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Trigger subtle haptic tactile feedback on mobile devices
 */
export async function triggerHapticFeedback(style: 'light' | 'medium' | 'success' = 'light'): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      if (style === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (style === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else {
        await Haptics.notification({ type: 'success' as any });
      }
    } else if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      // Fallback for mobile browsers supporting Web Vibration API
      if (style === 'light') {
        navigator.vibrate(15);
      } else if (style === 'medium') {
        navigator.vibrate(30);
      } else {
        navigator.vibrate([20, 50, 20]);
      }
    }
  } catch {
    // Ignore environments where vibration is unsupported or blocked by permissions
  }
}
