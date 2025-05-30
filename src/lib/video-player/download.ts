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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    if (response.ok) {
      blob = await response.blob();
    } else {
      throw new Error();
    }
  }

  return blob;
}