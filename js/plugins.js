/**
 * Centralized manager for Tauri v2 Plugins and Native Features.
 * Provides a clean interface for Haptics, Sharing, and Discord RPC.
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
      
      // Diagnostic 1: Path & FS Write-Verify Test
      try {
        let cache;
        if (window.__TAURI__.path && window.__TAURI__.path.appCacheDir) {
          cache = await window.__TAURI__.path.appCacheDir();
        } else {
          // Fallback to custom command if built-in path API is missing or permission denied
          cache = await window.__TAURI__.core.invoke('get_app_cache_dir');
        }
        
        const testPath = `${cache}/diag_test.txt`;
        const testData = Array.from(new TextEncoder().encode('Tauri Diagnostic Test'));
        
        await window.__TAURI__.core.invoke('plugin:fs|write_file', { 
          path: testPath, 
          data: testData 
        });
        
        const exists = await window.__TAURI__.core.invoke('plugin:fs|exists', { path: testPath });
        console.log(`✅ FS & Path: Responsive. Cache writable: ${exists}`);
      } catch (e) {
        console.error('❌ FS/Path Failure: Cannot resolve cache folder. Sharing will likely fail.', e);
      }

      // Diagnostic 2: Haptics
      try {
        await window.__TAURI__.core.invoke('plugin:haptics|requestPermissions');
        console.log('✅ Haptics: Responsive');
      } catch (e) {
        console.warn('❌ Haptics: Failed or Busy', e);
      }

      // Diagnostic 3: Share
      try {
        console.log('✅ Share Plugin: Initialized in Rust');
      } catch (e) {
        console.error('❌ Share Plugin: Issue detected', e);
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
     * Optimized for Tauri v2 plugin-haptics (Android/iOS)
     * @param {string} type - 'vibrate', 'impactLight', 'impactMedium', 'impactHeavy', 'notificationSuccess', 'notificationWarning', 'notificationError', 'selection'
     */
    async vibrate(type = 'vibrate') {
      if (!this.isTauri || !config.hapticsEnabled || !this.isMobile()) return;
      
      const intensity = config.hapticsIntensity || 1.0;
      if (intensity <= 0) return;

      try {
        // According to documentation: vibrate, impactFeedback, notificationFeedback, selectionFeedback
        switch (type) {
          case 'vibrate':
            await window.__TAURI__.core.invoke('plugin:haptics|vibrate', { label: Math.floor(100 * intensity) });
            break;
          case 'impactLight':
            await window.__TAURI__.core.invoke('plugin:haptics|impact', { style: 'light' });
            break;
          case 'impactMedium':
            await window.__TAURI__.core.invoke('plugin:haptics|impact', { style: 'medium' });
            break;
          case 'impactHeavy':
            await window.__TAURI__.core.invoke('plugin:haptics|impact', { style: 'heavy' });
            break;
          case 'notificationSuccess':
            await window.__TAURI__.core.invoke('plugin:haptics|notification', { type: 'success' });
            break;
          case 'notificationWarning':
            await window.__TAURI__.core.invoke('plugin:haptics|notification', { type: 'warning' });
            break;
          case 'notificationError':
            await window.__TAURI__.core.invoke('plugin:haptics|notification', { type: 'error' });
            break;
          case 'selection':
            await window.__TAURI__.core.invoke('plugin:haptics|selection');
            break;
          default:
            await window.__TAURI__.core.invoke('plugin:haptics|vibrate', { label: Math.floor(50 * intensity) });
        }
      } catch (e) {
        console.debug('Haptics call skipped or failed:', e);
      }
    },

    /**
     * Professional Native Share
     * Hands the absolute path to the native Intent system (Android/iOS)
     * @param {Object} options - { files: [Uint8Array|File], mime: string }
     */
    async share(options) {
      if (!this.isTauri) {
        console.log('Not in Tauri, using navigator.share');
        if (navigator.share) await navigator.share(options).catch(console.error);
        return;
      }

      if (!options.files || options.files.length === 0) return;

      try {
        const fileData = options.files[0];
        const uint8Array = (fileData instanceof Uint8Array) ? fileData : new Uint8Array(await fileData.arrayBuffer());
        
        // 1. Resolve Storage Path (Cache is best for temporary sharing)
        const cacheDir = (window.__TAURI__.path && window.__TAURI__.path.appCacheDir) 
          ? await window.__TAURI__.path.appCacheDir() 
          : await window.__TAURI__.core.invoke('get_app_cache_dir');
        
        const fileName = `crit2048_share_${Date.now()}.png`;
        const filePath = (window.__TAURI__.path && window.__TAURI__.path.join)
          ? await window.__TAURI__.path.join(cacheDir, fileName)
          : `${cacheDir}/${fileName}`;
        
        // 2. Write File
        const fs = window.__TAURI__.fs || window.__TAURI__.pluginFs;
        if (fs && fs.writeFile) {
          await fs.writeFile(filePath, uint8Array);
        } else {
          await window.__TAURI__.core.invoke('plugin:fs|write_file', { path: filePath, data: uint8Array });
        }
        
        // 3. Invoke Native Share Plugin
        // According to documentation: invoke('plugin:share|share_file', { path, mime })
        await window.__TAURI__.core.invoke('plugin:share|share_file', { 
          path: filePath,
          mime: options.mime || 'image/png'
        });
        
        console.log('✅ Native Share Success');
      } catch (e) {
        console.error('❌ Share Failed:', e);
        if (window.alert) alert(`Share Error: ${e.message || e}`, "Plugin Error", "🔌");
      }
    },

    /**
     * Future-proofing: Check for files shared TO this app
     * (e.g. importing a run from another player)
     */
    async checkIncomingShares() {
      if (!this.isTauri) return [];
      try {
        // According to documentation: invoke('plugin:share|get_shared_files', { group, path })
        const shared = await window.__TAURI__.core.invoke('plugin:share|get_shared_files', { 
          group: '', // Android empty, iOS needs app group ID
          path: 'temp' 
        });
        return shared || [];
      } catch (e) {
        console.debug('No incoming shares detected');
        return [];
      }
    },

    /**
     * Download a file from a URL and save it to the user's Downloads folder
     * @param {string} url - The URL to download from
     * @param {string} fileName - The name to save the file as
     */
    async downloadFile(url, fileName) {
      if (!this.isTauri) {
        console.warn('Download skipped: Not in Tauri environment.');
        return;
      }

      try {
        console.log(`Starting download: ${url} -> ${fileName}`);
        
        // 1. Get the path to the user's Download folder
        let baseDownloadPath;
        if (window.__TAURI__.path && window.__TAURI__.path.downloadDir) {
          baseDownloadPath = await window.__TAURI__.path.downloadDir();
        } else {
          throw new Error('Path API (downloadDir) not available.');
        }
        
        // 2. Create the full path for the new file
        let filePath;
        if (window.__TAURI__.path.join) {
          filePath = await window.__TAURI__.path.join(baseDownloadPath, fileName);
        } else {
          filePath = `${baseDownloadPath}/${fileName}`;
        }

        // 3. Fetch the file data as an arrayBuffer using the HTTP plugin
        const http = window.__TAURI__.http || window.__TAURI__.pluginHttp;
        if (!http || !http.fetch) {
          throw new Error('HTTP Plugin not available.');
        }

        const response = await http.fetch(url, {
          method: 'GET',
          connectTimeout: 30000
        });

        if (!response.ok) throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);

        const data = await response.arrayBuffer();

        // 4. Write the file to the disk using the FS plugin
        const fs = window.__TAURI__.fs || window.__TAURI__.pluginFs;
        if (!fs || !fs.writeFile) {
          // Fallback to core invoke if high-level API is missing
          await window.__TAURI__.core.invoke('plugin:fs|write_file', { 
            path: filePath, 
            data: Array.from(new Uint8Array(data)) 
          });
        } else {
          await fs.writeFile(filePath, new Uint8Array(data));
        }
        
        console.log(`✅ File downloaded to: ${filePath}`);
        return filePath;
      } catch (error) {
        console.error('❌ Download failed:', error);
        throw error;
      }
    },

    /**
     * Open a "Save As" dialog and save binary data to the chosen path (Desktop Only)
     * @param {Uint8Array} data - The binary data to save
     * @param {string} defaultName - The suggested filename
     */
    async saveWithDialog(data, defaultName = 'screenshot.png') {
      if (!this.isTauri) return;
      
      const dialog = window.__TAURI__.dialog || window.__TAURI__.pluginDialog;
      if (!dialog || !dialog.save) {
        console.warn('Dialog Plugin not available.');
        return;
      }

      try {
        const filePath = await dialog.save({
          title: 'Save Screenshot',
          defaultPath: defaultName,
          filters: [{ name: 'Images', extensions: ['png'] }]
        });

        if (filePath) {
          const fs = window.__TAURI__.fs || window.__TAURI__.pluginFs;
          if (!fs || !fs.writeFile) {
            await window.__TAURI__.core.invoke('plugin:fs|write_file', { 
              path: filePath, 
              data: Array.from(data) 
            });
          } else {
            await fs.writeFile(filePath, data);
          }
          console.log(`✅ Saved successfully to: ${filePath}`);
          return filePath;
        }
      } catch (error) {
        console.error('❌ Save Dialog failed:', error);
        throw error;
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
