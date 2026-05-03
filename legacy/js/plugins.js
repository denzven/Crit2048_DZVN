/**
 * Centralized manager for Tauri v2 Plugins and Native Features.
 * Provides a clean interface for Haptics, Sharing, and Discord RPC.
 *
 * Share / Save Architecture (Android):
 *  1. Generate image via ImageGenerator (pure Canvas 2D — no oklab)
 *  2. Write PNG bytes to external cache via 'save_to_gallery' command
 *  3. Invoke plugin:share|share with the returned file path
 *     → tauri-plugin-share wraps it in a FileProvider content:// URI
 *
 * Web fallback:
 *  - navigator.share({ files: [...] })  if available
 *  - Clipboard API (ClipboardItem) as second fallback
 *  - Browser <a download> as final fallback
 */

(function() {
  const Plugins = {
    // Check if running in Tauri environment
    isTauri: !!(window.__TAURI__ && window.__TAURI__.core),
    initialized: false,

    /**
     * Initialize plugins and perform self-diagnostics
     */
    async init() {
      if (!this.isTauri || this.initialized) return;
      this.initialized = true;
      
      console.log('--- Tauri Plugin Diagnostics ---');
      
      // Diagnostic: cache dir test
      try {
        const cache = await window.__TAURI__.core.invoke('get_app_cache_dir');
        console.log(`✅ App cache dir: ${cache}`);
      } catch (e) {
        console.error('❌ get_app_cache_dir failed:', e);
      }

      // Diagnostic: external cache
      try {
        const ext = await window.__TAURI__.core.invoke('get_external_cache_dir');
        console.log(`✅ External cache dir: ${ext}`);
      } catch (e) {
        console.warn('⚠️ get_external_cache_dir failed (may be normal on desktop):', e);
      }

      // Diagnostic: Haptics
      try {
        await window.__TAURI__.core.invoke('plugin:haptics|request_permissions').catch(() => {
          return window.__TAURI__.core.invoke('plugin:haptics|requestPermissions');
        }).catch(() => {
          console.debug('Haptics permission request skipped (likely not required on this platform)');
        });
        console.log('✅ Haptics: Responsive');
      } catch (e) {
        console.warn('❌ Haptics: Diagnostics failed', e);
      }

      console.log('--------------------------------');
    },

    /**
     * Explicitly request permissions (unused now as init handles it)
     */
    async requestPermissions() {
      return this.init();
    },

    /**
     * Trigger a haptic feedback (vibration)
     */
    async vibrate(type = 'vibrate') {
      if (!this.isTauri || !config.hapticsEnabled || !this.isMobile()) return;
      
      const intensity = config.hapticsIntensity || 1.0;
      if (intensity <= 0) return;

      try {
        console.log(`Triggering haptic: ${type} (intensity: ${intensity})`);
        switch (type) {
          case 'vibrate':
            await window.__TAURI__.core.invoke('plugin:haptics|vibrate', { duration: Math.floor(100 * intensity) });
            break;
          case 'impactLight':
            await window.__TAURI__.core.invoke('plugin:haptics|impact_feedback', { style: 'light' });
            break;
          case 'impactMedium':
            await window.__TAURI__.core.invoke('plugin:haptics|impact_feedback', { style: 'medium' });
            break;
          case 'impactHeavy':
            await window.__TAURI__.core.invoke('plugin:haptics|impact_feedback', { style: 'heavy' });
            break;
          case 'notificationSuccess':
            await window.__TAURI__.core.invoke('plugin:haptics|notification_feedback', { type: 'success' });
            break;
          case 'notificationWarning':
            await window.__TAURI__.core.invoke('plugin:haptics|notification_feedback', { type: 'warning' });
            break;
          case 'notificationError':
            await window.__TAURI__.core.invoke('plugin:haptics|notification_feedback', { type: 'error' });
            break;
          case 'selection':
            await window.__TAURI__.core.invoke('plugin:haptics|selection_feedback');
            break;
          default:
            await window.__TAURI__.core.invoke('plugin:haptics|vibrate', { duration: Math.floor(50 * intensity) });
        }
      } catch (e) {
        console.error(`❌ Haptics [${type}] failed:`, e);
      }
    },

    /**
     * Write image bytes to the external cache dir and return the path.
     * On Android the external cache is accessible via FileProvider so
     * tauri-plugin-share can create a content:// URI from it.
     * @param {Uint8Array} uint8Array
     * @param {string} fileName
     * @returns {Promise<string>} resolved file path
     */
    async _writeToExternalCache(uint8Array, fileName) {
      const dataArray = Array.from(uint8Array);
      // save_to_gallery writes to external cache on Android, downloads on desktop
      const filePath = await window.__TAURI__.core.invoke('save_to_gallery', {
        imageData: dataArray,
        fileName: fileName
      });
      console.log(`✅ Image written to: ${filePath}`);
      return filePath;
    },

    /**
     * Professional Native Share
     * On Tauri/Android: writes file then invokes share intent (FileProvider URI)
     * On web: navigator.share → clipboard → browser download
     * @param {Object} options - { files: [Uint8Array], title, text, fileName, mime }
     */
    async share(options) {
      const fileName = options.fileName || `crit2048_share_${Date.now()}.png`;
      const uint8Array = options.files && options.files.length > 0
        ? (options.files[0] instanceof Uint8Array ? options.files[0] : new Uint8Array(await options.files[0].arrayBuffer()))
        : null;

      // ── Tauri (Android / Desktop) ──────────────────────────────────────────
      if (this.isTauri) {
        if (!uint8Array) throw new Error('No image data provided');

        try {
          const filePath = await this._writeToExternalCache(uint8Array, fileName);
          
          // plugin:share|share — tauri-plugin-share handles FileProvider wrapping
          await window.__TAURI__.core.invoke('plugin:share|share', {
            title: options.title || 'Crit 2048 Run Summary',
            text: options.text || '',
            files: [filePath]
          });
          console.log('✅ Native Share Success');
          return;
        } catch (e) {
          if (e && (e.name === 'AbortError' || String(e).includes('AbortError'))) {
            console.log('Share cancelled by user');
            return;
          }
          console.error('❌ Native share failed, will rethrow:', e);
          throw e;
        }
      }

      // ── Web fallback chain ─────────────────────────────────────────────────
      if (!uint8Array) {
        throw new Error('No image data provided');
      }

      const blob = new Blob([uint8Array], { type: options.mime || 'image/png' });
      const file = new File([blob], fileName, { type: options.mime || 'image/png' });

      // Try navigator.share with file
      if (navigator.share) {
        try {
          const sharePayload = {
            title: options.title || 'Crit 2048',
            text: options.text || '',
          };
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            sharePayload.files = [file];
          }
          await navigator.share(sharePayload);
          console.log('✅ navigator.share success');
          return;
        } catch (e) {
          if (e.name === 'AbortError') return; // User dismissed
          console.warn('navigator.share failed, trying clipboard:', e);
        }
      }

      // Try clipboard API (modern browsers)
      try {
        await this._copyImageToClipboard(uint8Array);
        return;
      } catch (e) {
        console.warn('Clipboard copy failed, falling back to download:', e);
      }

      // Final fallback: browser download
      this._triggerBrowserDownload(uint8Array, fileName, options.mime || 'image/png');
    },

    /**
     * Save image — smart routing:
     *   Android Tauri → write to external cache → share sheet (user taps "Save to gallery")
     *   Desktop Tauri → Save As dialog
     *   Web → browser download
     * @param {Uint8Array} uint8Array
     * @param {string} fileName
     */
    async saveImage(uint8Array, fileName) {
      fileName = fileName || `crit2048_run_${Date.now()}.png`;

      // ── Tauri ──────────────────────────────────────────────────────────────
      if (this.isTauri) {
        if (this.isMobile()) {
          // Android: write to external cache, then share so user can "Save to Photos"
          try {
            const filePath = await this._writeToExternalCache(uint8Array, fileName);
            await window.__TAURI__.core.invoke('plugin:share|share', {
              title: 'Save to Gallery',
              text: 'Tap "Save image" or "Photos" to save your run card.',
              files: [filePath]
            });
            return;
          } catch (e) {
            if (e && (e.name === 'AbortError' || String(e).includes('AbortError'))) return;
            console.error('Save via share sheet failed:', e);
            // Fall through to clipboard
            try {
              await this._copyImageToClipboard(uint8Array);
              alert('Saved to clipboard! Paste it in any app.', 'Copied!', '📋');
            } catch (ce) {
              this._triggerBrowserDownload(uint8Array, fileName, 'image/png');
            }
          }
        } else {
          // Desktop: show Save As dialog
          await this.saveWithDialog(uint8Array, fileName);
        }
        return;
      }

      // ── Web ────────────────────────────────────────────────────────────────
      // Try clipboard first on mobile web
      if (this.isMobile() && navigator.clipboard && window.ClipboardItem) {
        try {
          await this._copyImageToClipboard(uint8Array);
          return;
        } catch (e) {
          console.warn('Clipboard failed on web mobile, downloading:', e);
        }
      }
      this._triggerBrowserDownload(uint8Array, fileName, 'image/png');
    },

    /**
     * Copy a PNG Uint8Array to the system clipboard.
     * Requires ClipboardItem API (Chrome 98+, Safari 13.1+).
     */
    async _copyImageToClipboard(uint8Array) {
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error('ClipboardItem API not supported');
      }
      const blob = new Blob([uint8Array], { type: 'image/png' });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      console.log('✅ Image copied to clipboard');
      alert('Image copied to clipboard! Paste it in any app to share.', 'Copied to Clipboard!', '📋');
    },

    /**
     * Trigger a browser <a download> for the given bytes.
     */
    _triggerBrowserDownload(uint8Array, fileName, mime = 'image/png') {
      const blob = new Blob([uint8Array], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = fileName;
      a.href = url;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      console.log('✅ Browser download triggered');
    },

    /**
     * Open a "Save As" dialog and save binary data (Desktop Only).
     */
    async saveWithDialog(data, defaultName = 'screenshot.png') {
      if (!this.isTauri) return;
      
      const dialog = window.__TAURI__.dialog || window.__TAURI__.pluginDialog;
      if (!dialog || !dialog.save) {
        console.warn('Dialog Plugin not available, falling back to download.');
        this._triggerBrowserDownload(data, defaultName);
        return;
      }

      try {
        const filePath = await dialog.save({
          title: 'Save Screenshot',
          defaultPath: defaultName,
          filters: [{ name: 'Images', extensions: ['png'] }]
        });

        if (filePath) {
          await window.__TAURI__.core.invoke('save_to_gallery', {
            imageData: Array.from(data),
            fileName: defaultName
          }).catch(async () => {
            // Fallback: use fs plugin
            await window.__TAURI__.core.invoke('plugin:fs|write_file', {
              path: filePath,
              data: Array.from(data)
            });
          });
          console.log(`✅ Saved successfully to: ${filePath}`);
          alert(`Saved successfully!`, 'Saved!', '✅');
          return filePath;
        }
      } catch (error) {
        console.error('❌ Save Dialog failed:', error);
        throw error;
      }
    },

    /**
     * Future-proofing: Check for files shared TO this app
     */
    async checkIncomingShares() {
      if (!this.isTauri) return [];
      try {
        const shared = await window.__TAURI__.core.invoke('plugin:share|get_shared_files', {
          group: '',
          path: 'temp'
        });
        return shared || [];
      } catch (e) {
        console.debug('No incoming shares detected');
        return [];
      }
    },

    /**
     * Check if running on a mobile platform
     */
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Update Discord Rich Presence (Desktop Only)
     */
    async updatePresence(details, stateStr) {
      if (!this.isTauri) return;
      try {
        await window.__TAURI__.core.invoke('set_discord_presence', {
          details: details || "Main Menu",
          stateStr: stateStr || "Preparing for a run..."
        });
      } catch (e) {
        console.debug('DRP update skipped');
      }
    }
  };

  window.Plugins = Plugins;
})();
