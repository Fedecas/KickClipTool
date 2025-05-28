<script lang="ts">
  import { Download } from 'lucide-svelte';

  import { invoke } from '@tauri-apps/api/core';
  import { exists, readFile } from '@tauri-apps/plugin-fs';

  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    id: string;
    url: string;
  }

  let { id, url }: Props = $props();
  let downloading = $state(false);

  async function handleDownload(): Promise<void> {
    console.debug('downloading', `${id}.mp4`, '...');
    downloading = true;
    let resultPath: string;
    let blob: Blob | null = null;
    try {
      resultPath = await invoke('download_m3u8_as_mp4', { url });
      console.warn(resultPath);
      if (await exists(resultPath)) {
        const result = await readFile(resultPath);
        blob = new Blob([result], { type: 'video/mp4' });
      } else {
        throw new Error("Some error");
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    }

    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const linkElement = document.createElement('a');
      linkElement.href = blobUrl;
      linkElement.download = `${id}.mp4`;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      URL.revokeObjectURL(blobUrl);
    }
    downloading = false;
  }
</script>

<button
  type="button"
  disabled={downloading}
  aria-label="Download video"
  onclick={handleDownload}
  class="rounded-sm p-2 transition duration-300 ease-in-out group
          { downloading ?
            'bg-black outline cursor-not-allowed' :
            'bg-(--primary) hover:bg-black hover:outline hover:scale-120'
          }">
  <div class="size-8">
    {#if !downloading}
    <Download class="size-full text-black group-hover:text-white" />
    {:else}
    <div class="">
      <Spinner />
    </div>
    {/if}
  </div>
</button>