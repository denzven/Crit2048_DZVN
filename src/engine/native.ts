/**
 * NATIVE PLUGIN WRAPPER (PWA Version)
 * Replaces Tauri plugins with standard Web APIs.
 */

export const Native = {
  /**
   * Haptics / Vibration
   */
  vibrate(pattern: number | number[] = 50, intensity = 1.0) {
    if (!navigator.vibrate) return;
    try {
      if (Array.isArray(pattern)) {
        const scaled = pattern.map((p) => p * intensity);
        navigator.vibrate(scaled);
      } else {
        navigator.vibrate(pattern * intensity);
      }
    } catch {
      console.warn('Vibration failed');
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { files, ...rest } = options;
        await navigator.share(rest);
      }
      return true;
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return false;
      console.error('Share failed', e);
      return false;
    }
  },

  /**
   * Screen Wake Lock
   */
  _wakeLock: null as { release: () => void } | null,
  async requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      this._wakeLock = await (
        navigator as unknown as {
          wakeLock: { request: (type: string) => Promise<{ release: () => void }> };
        }
      ).wakeLock.request('screen');
      console.log('💡 Wake Lock active');
    } catch {
      console.warn('Wake Lock failed');
    }
  },

  releaseWakeLock() {
    if (this._wakeLock) {
      this._wakeLock.release();
      this._wakeLock = null;
    }
  },

  /**
   * Web Notifications
   */
  async notify(title: string, body: string, icon = '/app_icon.png') {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body, icon });
      }
    }
  },

  /**
   * App Badging
   */
  setBadge(count: number) {
    if ('setAppBadge' in navigator) {
      (navigator as unknown as { setAppBadge: (c: number) => Promise<void> })
        .setAppBadge(count)
        .catch(console.error);
    }
  },

  clearBadge() {
    if ('clearAppBadge' in navigator) {
      (navigator as unknown as { clearAppBadge: () => Promise<void> })
        .clearAppBadge()
        .catch(console.error);
    }
  },

  /**
   * Platform Detection
   */
  isIOS() {
    if (typeof navigator === 'undefined' || typeof document === 'undefined') return false;
    return (
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
        navigator.platform,
      ) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  },

  isStandalone() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  },
};
