import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import renderer from 'vite-plugin-electron-renderer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), renderer()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
