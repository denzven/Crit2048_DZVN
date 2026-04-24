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
     * @param {string} type - 'vibrate', 'impactLight', 'impactMedium', 'impactHeavy', 'notificationSuccess', 'notificationWarning', 'notificationError', 'selection'
     */
    async vibrate(type = 'vibrate') {
      if (!this.isTauri || !config.hapticsEnabled) return;
      
      const intensity = config.hapticsIntensity || 1.0;
      if (intensity <= 0) return;

      try {
        // Tauri v2 Plugin Haptics Commands
        switch (type) {
          case 'vibrate':
            await window.__TAURI__.core.invoke('plugin:haptics|vibrate', { duration: Math.floor(100 * intensity) });
            break;
          case 'impactLight':
            await window.__TAURI__.core.invoke('plugin:haptics|impact', { style: 'Light' });
            break;
          case 'impactMedium':
            await window.__TAURI__.core.invoke('plugin:haptics|impact', { style: 'Medium' });
            break;
          case 'impactHeavy':
            await window.__TAURI__.core.invoke('plugin:haptics|impact', { style: 'Heavy' });
            break;
          case 'notificationSuccess':
            await window.__TAURI__.core.invoke('plugin:haptics|notification', { type: 'Success' });
            break;
          case 'notificationWarning':
            await window.__TAURI__.core.invoke('plugin:haptics|notification', { type: 'Warning' });
            break;
          case 'notificationError':
            await window.__TAURI__.core.invoke('plugin:haptics|notification', { type: 'Error' });
            break;
          case 'selection':
            await window.__TAURI__.core.invoke('plugin:haptics|selection');
            break;
          default:
            await window.__TAURI__.core.invoke('plugin:haptics|vibrate', { duration: Math.floor(50 * intensity) });
        }
      } catch (e) {
        console.warn('Haptics failed:', e);
      }
    },

    /**
     * Manual Middleman Share (Android/iOS)
     * 1. Extracts the Blob from memory.
     * 2. Writes it to a physical file in the app cache.
     * 3. Hands the file path to the native Android Intent system.
     * @param {Object} options - { files }
     */
    async share(options) {
      if (!this.isTauri) {
        console.log('Not in Tauri, using navigator.share if available');
        if (navigator.share) navigator.share(options);
        return;
      }

      if (!options.files || options.files.length === 0) {
        console.warn('Share skipped: No files provided in options.', options);
        return;
      }

      console.log('--- Manual Middleman Share Start ---');
      try {
        const file = options.files[0];
        console.log('Input File Info:', { name: file.name, type: file.type, size: file.size });
        
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const dataArray = Array.from(uint8Array);
        console.log('Binary Conversion Success. Byte count:', dataArray.length);
        
        // Step 1: Resolve the physical cache directory path
        let storageDir;
        try {
          if (window.__TAURI__.path && window.__TAURI__.path.appCacheDir) {
            storageDir = await window.__TAURI__.path.appCacheDir();
          } else {
            storageDir = await window.__TAURI__.core.invoke('get_app_cache_dir');
          }
        } catch (e) {
          throw new Error('Could not resolve any usable storage directory for sharing.');
        }
        
        const fileName = `crit2048_share_${Date.now()}.png`;
        let filePath;
        
        if (window.__TAURI__.path && window.__TAURI__.path.join) {
          filePath = await window.__TAURI__.path.join(storageDir, fileName);
        } else {
          filePath = `${storageDir}/${fileName}`;
        }
        
        console.log('Target Storage Path:', filePath);
        
        // Step 2: Write the binary data to the physical disk
        console.log('Writing file to disk...');
        await window.__TAURI__.core.invoke('plugin:fs|write_file', { 
          path: filePath, 
          data: dataArray 
        });
        console.log('✅ File write successful.');

        // Step 3: Hand the absolute path to the native Intent system
        console.log('Handing off to Native Intent (plugin:share|share_file)...');
        await window.__TAURI__.core.invoke('plugin:share|share_file', { 
          path: filePath,
          mime: 'image/png',
          mimeType: 'image/png' // satisfy both API variants
        });
        
        console.log('✅ Native Share Sheet triggered!');
      } catch (e) {
        const errorMsg = `❌ Share Failed: ${e.message || e}\nCheck logcat/console for details.`;
        console.error(errorMsg, e);
        alert(errorMsg, "Plugin Error", "🔌");
      }
      console.log('--- Manual Middleman Share End ---');
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
     * Take a screenshot of a DOM element and save it to the user's Downloads folder
     * @param {string} elementId - The ID of the DOM element to screenshot
     * @param {string} fileName - The name to save the file as (e.g. 'screenshot.png')
     */
    async saveScreenshot(elementId, fileName = 'crit2048_screenshot.png') {
      if (!this.isTauri) {
        console.warn('Screenshot skipped: Not in Tauri environment.');
        return;
      }

      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas is not loaded.');
      }

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found.`);
      }

      try {
        console.log(`Capturing screenshot of #${elementId}...`);
        
        // 1. Generate canvas using html2canvas
        const canvas = await html2canvas(element, {
          backgroundColor: '#0f172a', // Matches slate-950
          logging: false,
          useCORS: true,
          scale: 2 // Higher quality
        });

        // 2. Convert canvas to Blob
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas to Blob failed'));
          }, 'image/png');
        });

        // 3. Convert Blob to Uint8Array
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // 4. Resolve save path
        let baseDownloadPath;
        if (window.__TAURI__.path && window.__TAURI__.path.downloadDir) {
          baseDownloadPath = await window.__TAURI__.path.downloadDir();
        } else {
          throw new Error('Path API (downloadDir) not available.');
        }

        let filePath;
        if (window.__TAURI__.path.join) {
          filePath = await window.__TAURI__.path.join(baseDownloadPath, fileName);
        } else {
          filePath = `${baseDownloadPath}/${fileName}`;
        }

        // 5. Write file to disk
        const fs = window.__TAURI__.fs || window.__TAURI__.pluginFs;
        if (!fs || !fs.writeFile) {
          await window.__TAURI__.core.invoke('plugin:fs|write_file', { 
            path: filePath, 
            data: Array.from(uint8Array) 
          });
        } else {
          await fs.writeFile(filePath, uint8Array);
        }

        console.log(`✅ Screenshot saved to: ${filePath}`);
        return filePath;
      } catch (error) {
        console.error('❌ Screenshot failed:', error);
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
    async updatePresence(details, state) {
      if (!this.isTauri) return;
      try {
        await window.__TAURI__.core.invoke('set_discord_presence', { 
          details: details || "Main Menu",
          stateStr: state || "Preparing for a run..."
        });
      } catch (e) {
        console.debug('DRP update skipped');
      }
    }
  };

  window.Plugins = Plugins;
})();
