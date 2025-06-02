<script lang="ts">
  import { Download } from 'lucide-svelte';

  import Spinner from '$lib/Spinner.svelte';
  import { downloadClip } from './download';

  interface Props {
    id: string;
    url: string;
    downloads: string[];
  }

  let { id, url, downloads = $bindable() }: Props = $props();
  let downloading = $derived(downloads.includes(id));
  let progress = $state(0);
  let total = $state(0);

  // @ts-ignore
  const isTauri = !!window.__TAURI_INTERNALS__;

  async function handleDownload(): Promise<void> {
    let filename = `${id}.mp4`
    console.debug('downloading', filename, '...');
    downloads.push(id);
    let blob: Blob | null = null;
    let unlisten;
    try {
      const { listen } = await import('@tauri-apps/api/event');
      unlisten = await listen(id, ({ payload }: { payload: number }) => {
        if (total !== 0 && payload !== 0) {
          progress = payload;
        } else if (total === 0) {
          total = payload;
        }
      });

      blob = await downloadClip(isTauri, url, id);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      if (unlisten) unlisten();
    }

    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const linkElement = document.createElement('a');
      linkElement.href = blobUrl;
      linkElement.download = filename;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      URL.revokeObjectURL(blobUrl);
    }
    downloads.splice(downloads.indexOf(id), 1);
  }
</script>

<button
  type="button"
  disabled={!isTauri || downloading}
  aria-label="Download video"
  onclick={handleDownload}
  title={ isTauri ? 'Download video' : 'Clip download is disabled in the web version' }
  class="rounded-sm p-2 transition duration-300 ease-in-out group
          { !isTauri ? 'cursor-not-allowed' : '' }
          { downloading ?
            'bg-black outline cursor-not-allowed' :
            'bg-(--primary) hover:bg-black hover:outline hover:scale-120'}">
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