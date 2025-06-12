import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapterStatic from '@sveltejs/adapter-static';
import adapterAuto from '@sveltejs/adapter-auto';

const target = process.env.BUILD_TARGET || 'auto';
const adapter =
  target === 'tauri'
    ? adapterStatic({
        pages: 'build',
        assets: 'build',
        fallback: '200.html',
        precompress: false,
        strict: true
      })
    : adapterAuto(); // Auto by default

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: { adapter }
};

export default config;
