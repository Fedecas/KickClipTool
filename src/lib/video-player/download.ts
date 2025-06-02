export async function downloadClip(isTauri: boolean, url: string, id: string): Promise<Blob | null> {
  let blob: Blob | null = null;
  if (isTauri) {
    const { exists, readFile } = await import('@tauri-apps/plugin-fs');
    const { invoke } = await import('@tauri-apps/api/core');

    const resultPath: string = await invoke('download_m3u8_as_mp4', { url });
    if (await exists(resultPath)) {
      const result = await readFile(resultPath);
      blob = new Blob([result], { type: 'video/mp4' });
    } else {
      throw new Error("Result path does not exist");
    }
  } else { // Temporary (?) disable download endpoint for web
    /*const response = await fetch('/api/download', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      blob = await response.blob();
    } else {
      const data = await response.json();
      console.error(`Network response was not ok: ${response.status} (${data.error})`);
    }*/
   console.warn('Clip download is disabled in the web version');
  }

  return blob;
}