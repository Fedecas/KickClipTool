import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapterStatic from '@sveltejs/adapter-static';
import adapterNode from '@sveltejs/adapter-node';

const target = process.env.BUILD_TARGET || 'node';
const adapter =
  target === 'tauri'
    ? adapterStatic({
        pages: 'build',
        assets: 'build',
        fallback: '200.html',
        precompress: false,
        strict: true
      })
    : adapterNode({  // Node by default
        out: 'build',
        precompress: true,
        envPrefix: ''
      });

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: { adapter }
};

export default config;
