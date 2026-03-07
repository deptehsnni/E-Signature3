import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // 1. Meningkatkan batas peringatan ukuran chunk agar log build lebih bersih
    chunkSizeWarningLimit: 1000,
    
    // 2. Optimasi Rollup untuk memecah library besar (seperti xlsx atau lucide) 
    // agar loading aplikasi lebih cepat dan stabil di browser
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Memisahkan semua library pihak ketiga ke dalam file 'vendor'
            return 'vendor';
          }
        },
      },
    },
  },
  // 3. Memastikan server pengembangan (local dev) sinkron dengan backend api/
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
