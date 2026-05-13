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
      console.warn('💡 Wake Lock active');
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
   * Web Notifications (Rich support)
   */
  async notify(title: string, body: string, icon = 'app_icon.png', image = 'banner.png') {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    const getAbsUrl = (path: string) => {
      // Handle Emoji icons by rendering to canvas
      if (path.length <= 4 && /\p{Emoji}/u.test(path)) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.font = '96px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(path, 64, 70);
            return canvas.toDataURL();
          }
        } catch (e) {
          console.warn('Emoji render failed', e);
        }
      }

      try {
        const url = new URL(path, window.location.href);
        return url.href;
      } catch {
        return path;
      }
    };

    const show = async () => {
      try {
        const options = {
          body,
          icon: getAbsUrl(icon),
          image: getAbsUrl(image),
          badge: getAbsUrl(icon),
          vibrate: [200, 100, 200],
          tag: 'crit2048-alert',
          renotify: true,
        };

        if ('serviceWorker' in navigator) {
          try {
            // Use ready to ensure we have an active registration
            const registration = await Promise.race([
              navigator.serviceWorker.ready,
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)),
            ]);

            if (registration && registration.showNotification) {
              const richOptions = {
                ...options,
                actions: [
                  { action: 'play', title: '⚔️ Play Now' },
                  { action: 'settings', title: '⚙️ Settings' },
                ],
              };
              await registration.showNotification(title, richOptions as NotificationOptions);
              return;
            }
          } catch (swErr) {
            console.warn('⚠️ SW Notification failed:', swErr);
          }
        }

        // Fallback to standard Notification API
        new Notification(title, options as unknown as NotificationOptions);
      } catch (e) {
        console.error('❌ Failed to show notification:', e);
      }
    };

    if (Notification.permission === 'granted') {
      await show();
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await show();
      }
    }
  },

  /**
   * Schedule a future notification (Background Retention)
   */
  async scheduleNotification(title: string, body: string, delayMs: number, icon = 'app_icon.png') {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      if (!registration) return;

      if ('showTrigger' in Notification.prototype && 'TimestampTrigger' in window) {
        const options = {
          body,
          icon,
          showTrigger: new (
            window as unknown as Record<string, new (t: number) => unknown>
          ).TimestampTrigger(Date.now() + delayMs),
        };
        registration.showNotification(title, options as NotificationOptions);
      }
    } catch (e) {
      console.warn('Notification scheduling failed', e);
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
