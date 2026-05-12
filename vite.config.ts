import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/Crit2048-DZVN/', // Use VITE_BASE_PATH=./ for Electron/Webview build
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'app_icon.png',
        'challenge-banner.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'sitemap.xml',
        'robots.txt',
        'humans.txt',
      ],
      manifest: {
        name: 'Crit2048 - a D&D inspired 2048 roguelike dungeon-crawler',
        short_name: 'Crit2048',
        description: 'D&D inspired 2048 roguelike dungeon-crawler with deep modding support',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait',
        categories: ['games', 'puzzle', 'strategy', 'role-playing', 'entertainment'],
        lang: 'en',
        dir: 'ltr',
        prefer_related_applications: false,
        launch_handler: {
          client_mode: ['focus-existing', 'auto'],
        },
        handle_links: 'auto',
        screenshots: [
          {
            src: 'banner.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Crit 2048 Gameplay Banner',
          },
          {
            src: 'challenge-banner.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Crit 2048 Challenge Mode',
          },
        ],
        start_url: './',
        id: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Resume Last Run',
            short_name: 'Resume',
            description: 'Continue your progress in the dungeon',
            url: './?action=resume',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Start New Game',
            short_name: 'New Game',
            description: 'Begin a new run in the dungeon',
            url: './?action=new_game',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Open the Forge',
            short_name: 'Forge',
            description: 'Create and mod your own content',
            url: './?action=forge',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'The Grimoire',
            short_name: 'Grimoire',
            description: 'Browse community content packs',
            url: './?action=grimoire',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
          /^\/humans\.txt$/,
          /^\/404$/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/s\/e\/notoemoji\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'noto-emoji-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
