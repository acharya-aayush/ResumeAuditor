import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - rarely change, better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts'],
          'vendor-markdown': ['react-markdown'],
          'vendor-docx': ['docx', 'file-saver'],
        }
      }
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Increase chunk size warning limit (recharts is large)
    chunkSizeWarningLimit: 800,
    // Minify for production
    minify: 'esbuild',
    // Generate source maps for debugging (optional)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'react-markdown', 'lucide-react'],
  }
});
