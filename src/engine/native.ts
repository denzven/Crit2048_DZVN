/**
 * NATIVE PLUGIN WRAPPER (PWA Version)
 * Replaces Tauri plugins with standard Web APIs.
 */

export const Native = {
  /**
   * Haptics / Vibration
   */
  vibrate(pattern: number | number[] = 50) {
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration failed', e);
    }
  },

  /**
   * Web Share API
   */
  async share(options: { title?: string; text?: string; url?: string; files?: File[] }) {
    if (!navigator.share) {
      console.warn('Sharing not supported on this browser');
      return false;
    }

    try {
      if (options.files && navigator.canShare && navigator.canShare({ files: options.files })) {
        await navigator.share(options);
      } else {
        // Fallback to text/url only
        const { files, ...rest } = options;
        await navigator.share(rest);
      }
      return true;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return false;
      console.error('Share failed', e);
      return false;
    }
  },

  /**
   * Screen Wake Lock
   */
  _wakeLock: null as any,
  async requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      this._wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('💡 Wake Lock active');
    } catch (e) {
      console.warn('Wake Lock failed', e);
    }
  },

  releaseWakeLock() {
    if (this._wakeLock) {
      this._wakeLock.release();
      this._wakeLock = null;
    }
  },

  /**
   * App Badging
   */
  setBadge(count: number) {
    if ('setAppBadge' in navigator) {
      (navigator as any).setAppBadge(count).catch(console.error);
    }
  },

  clearBadge() {
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge().catch(console.error);
    }
  }
};
