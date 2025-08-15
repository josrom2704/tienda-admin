import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for React project with Tailwind CSS support
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
  build: {
    outDir: 'dist'
  }
});