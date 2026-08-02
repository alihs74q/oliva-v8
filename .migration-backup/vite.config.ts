import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      // Use our custom hand-written sw.js from public/ — Vite serves it as-is
      // in dev and copies it to dist/ in production.
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'Oliva — Padel & Café',
        short_name: 'Oliva',
        description: "A grove, two courts, and the slowest afternoon you've ever had.",
        theme_color: '#1b5e20',
        background_color: '#1a2e1a',
        display: 'standalone',
        icons: [
          {
            src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oliva-logo-7vdw2NsA2Wofs4TtAyO49iJkZo8nn1.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oliva-logo-7vdw2NsA2Wofs4TtAyO49iJkZo8nn1.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Aggressive minification for smaller output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    // Compress larger chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
        },
      },
    },
  },
});
