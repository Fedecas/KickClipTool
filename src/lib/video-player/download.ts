import { exists, readFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';

export async function downloadClip(url: string): Promise<Blob | null> {
  let blob: Blob | null = null;
  // @ts-ignore
  if (!!window.__TAURI_INTERNALS__) {
    const resultPath: string = await invoke('download_m3u8_as_mp4', { url });
    if (await exists(resultPath)) {
      const result = await readFile(resultPath);
      blob = new Blob([result], { type: 'video/mp4' });
    }
  } else {
    const response = await fetch('/api/download', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      blob = await response.blob();
    } else {
      const data = await response.json();
      console.error(`Network response was not ok: ${response.status} (${data.error})`);
    }
  }

  return blob;
}