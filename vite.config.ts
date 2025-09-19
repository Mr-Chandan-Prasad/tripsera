import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Set the root directory and public directory
  root: '.',
  publicDir: 'public',
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('lucide-react')) {
              return 'ui';
            }
            if (id.includes('@stripe') || id.includes('razorpay')) {
              return 'payment';
            }
            if (id.includes('mysql2')) {
              return 'database';
            }
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf';
            }
            if (id.includes('qrcode')) {
              return 'qr';
            }
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Disable source maps for production (faster builds)
    sourcemap: false,
    // Use esbuild for faster minification
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles
    target: 'esnext',
  },
  // Development server optimizations
  server: {
    hmr: {
      overlay: false,
    },
    // Enable compression
    middlewareMode: false,
    // Optimize file watching
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  // Pre-bundle optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
    ],
    exclude: ['@stripe/stripe-js', 'mysql2'],
    // Force pre-bundling of these dependencies
    force: true,
  },
  // CSS optimization
  css: {
    devSourcemap: false,
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename: string) {
      return `/${filename}`;
    },
  },
});
