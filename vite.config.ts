import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — сайтты кез келген статикалық хостингке (GitHub Pages, Netlify) қоюға болады
export default defineConfig({
  base: './',
  plugins: [react()],
});
