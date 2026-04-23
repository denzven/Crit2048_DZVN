/**
 * Centralized manager for Tauri v2 Plugins and Native Features.
 * Provides a clean interface for Haptics, Sharing, and Discord RPC.
 */

(function() {
  const Plugins = {
    // Check if running in Tauri environment
    isTauri: !!(window.__TAURI__),

    /**
     * Trigger a haptic feedback (vibration)
     * @param {string} type - 'vibrate', 'impactLight', 'impactMedium', 'impactHeavy', 'notificationSuccess', etc.
     */
    async vibrate(type = 'vibrate') {
      if (!this.isTauri) return;
      try {
        // pattern for tauri-plugin-haptics v2
        await window.__TAURI__.core.invoke('plugin:haptics|vibrate', { type });
      } catch (e) {
        console.warn('Haptics failed:', e);
      }
    },

    /**
     * Use the native sharesheet to share content
     * @param {Object} options - { title, text, url, files }
     */
    async share(options) {
      if (!this.isTauri) {
        // Fallback to Web Share API if possible
        if (navigator.share) {
          return navigator.share(options).catch(console.error);
        }
        return;
      }

      try {
        // pattern for tauri-plugin-sharekit v2
        await window.__TAURI__.core.invoke('plugin:sharekit|share', { 
            title: options.title || "Crit 2048",
            text: options.text || "",
            url: options.url || ""
            // Note: Files handling varies by plugin implementation
        });
      } catch (e) {
        console.warn('Native share failed, trying fallback:', e);
        if (navigator.share) await navigator.share(options).catch(console.error);
      }
    },

    /**
     * Update Discord Rich Presence (Desktop Only)
     * @param {string} details - Primary status line
     * @param {string} state - Secondary status line
     */
    async updatePresence(details, state) {
      if (!this.isTauri) return;
      try {
        await window.__TAURI__.core.invoke('set_discord_presence', { 
          details: details || "Main Menu",
          stateStr: state || "Preparing for a run..."
        });
      } catch (e) {
        // Quietly fail as DRP might not be connected or supported on platform
        console.debug('DRP update skipped');
      }
    }
  };

  window.Plugins = Plugins;
})();
