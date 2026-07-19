import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { compression } from 'vite-plugin-compression2'; // New: For ultra-fast asset delivery

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [
      react({ fastRefresh: true }), 
      tailwindcss(),
      // 1. Pre-compress everything into Brotli and Gzip in production.
      // This means 0ms compression delay on your Nginx/NestJS server.
      isProd && compression({ algorithm: 'brotliCompress', exclude: [/\.(br)$/, /\.(gz)$/] }),
      isProd && compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
    ].filter(Boolean), // Filters out false values in development

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    optimizeDeps: {
      exclude: ['framer-motion'],
    },

    server: {
      host: true, // listen on all addresses (equivalent to --host=0.0.0.0)
      strictPort: true, // fail loudly if 5173 is taken instead of silently starting a 2nd server (breaks HMR)
      hmr:
        process.env.DISABLE_HMR === 'true'
          ? false
          : {
              // Force the browser HMR client to connect to localhost instead of 0.0.0.0,
              // which fails silently when the server is bound to 0.0.0.0.
              host: 'localhost',
              protocol: 'ws',
              port: 5173,
            },
      watch: {
        // Windows file-system events can be unreliable; polling guarantees saves are detected.
        usePolling: true,
        interval: 100,
      },
      proxy: {
        '/api/v1': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      sourcemap: !isProd,
      chunkSizeWarningLimit: 500,
      minify: 'terser', // Safer minification for complex libraries like motion
      cssMinify: true,   // Aggressively shrinks Tailwind's output
      
      rollupOptions: {
        // 2. Aggressive Tree-Shaking configuration
        treeshake: {
          preset: 'recommended',
          propertyReadSideEffects: true, // Preserve side-effectful property reads
        },
        output: {
          // 3. Isolated Chunking Strategy for the "Reactive Store Hydration" pattern
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
            return 'vendor-utils';
          },
          // Cache busting optimization: gives predictable hashing for long-term browser caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  };
});