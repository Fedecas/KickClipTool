function saveClipFile(blob: Blob, id: string) {
  const filename = `${id}.mp4`;
  const blobUrl = URL.createObjectURL(blob);
  const linkElement = document.createElement('a');
  linkElement.href = blobUrl;
  linkElement.download = filename;
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(blobUrl);
}

async function getClipFile(url: string): Promise<Blob | null> {
  const { exists, readFile } = await import('@tauri-apps/plugin-fs');
  const { invoke } = await import('@tauri-apps/api/core');
  let result = null;

  try {
    const resultPath: string = await invoke('download_m3u8_as_mp4', { url });
    if (!await exists(resultPath)) {
      throw new Error("Result path does not exist");
    }
    const content = await readFile(resultPath);
    result = new Blob([content], { type: 'video/mp4' });
  } catch (error) {
    console.error("Error obtaining clip file:", error);
  }

  return result;
}

export async function downloadClip(isTauri: boolean, url: string, id: string) {
  let blob = null;
  if (isTauri) {
    blob = await getClipFile(url);
  } else {
    console.warn('Clip download is disabled in the web version');
  }

  if (blob) {
    saveClipFile(blob, id);
  }
}