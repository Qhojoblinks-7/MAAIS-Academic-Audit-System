import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import compression from 'vite-plugin-compression2'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react({ fastRefresh: true }),
    tailwindcss(),
    compression({
      algorithm: 'gzip',
      threshold: 1024,
    }),
    compression({
      algorithm: 'brotliCompress',
      threshold: 1024,
      ext: '.br',
    }),
    mode === 'production' && VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'MAAIS Academic Audit System',
        shortName: 'MAAIS',
        description: 'MAAIS Academic Audit System - Mando Senior High Technical School',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
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
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        disableDevLogs: true,
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
            urlPattern: /^https:\/\/maais-backend-49i4\.onrender\.com\/api\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 20,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    false,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['framer-motion'],
  },
  server: {
    host: true,
    strictPort: true,
    hmr: process.env.DISABLE_HMR === 'true' ? false : {
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api/v1': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        propertyReadSideEffects: true,
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('d3')) return 'charts';
          if (id.includes('html2canvas') || id.includes('jspdf')) return 'export-utils';
          if (id.includes('motion') || id.includes('framer-motion')) return 'animations';
          if (id.includes('zustand') || id.includes('@tanstack') || id.includes('localforage')) {
            return 'state-engine';
          }
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance')) {
            return 'utils';
          }
          if (id.includes('@radix-ui') || id.includes('cmdk')) return 'ui-primitives';
          if (id.includes('react-day-picker')) return 'date-picker';
          if (id.includes('embla-carousel')) return 'carousel';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('papaparse') || id.includes('xlsx')) return 'data-io';
          if (id.includes('react-router')) return 'router';
          return 'vendor-utils';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
}))
