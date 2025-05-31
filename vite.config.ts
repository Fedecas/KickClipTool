import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    sveltekit(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      external: mode === 'tauri' ? [] : ['@tauri-apps/plugin-fs']
    }
  }
}));
