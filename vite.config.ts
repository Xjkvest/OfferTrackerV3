import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  base: mode === 'production' ? './' : '/',
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === 'production' && 
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-accordion', 
            '@radix-ui/react-dialog',
            // Add other UI components here
          ],
          charts: ['@nivo/bar', '@nivo/line', '@nivo/pie', '@nivo/core'],
        }
      }
    }
  }
}));
