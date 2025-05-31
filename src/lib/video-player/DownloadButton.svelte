<script lang="ts">
  import { Download } from 'lucide-svelte';

  import Spinner from '$lib/Spinner.svelte';
  import { downloadClip } from './download';

  interface Props {
    id: string;
    url: string;
  }

  let { id, url }: Props = $props();
  let downloading = $state(false);

  // @ts-ignore
  const isTauri = !!window.__TAURI_INTERNALS__;

  async function handleDownload(): Promise<void> {
    console.debug('downloading', `${id}.mp4`, '...');
    downloading = true;
    let blob: Blob | null = null;
    try {
      blob = await downloadClip(isTauri, url);
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
  disabled={!isTauri || downloading}
  aria-label="Download video"
  onclick={handleDownload}
  title={ isTauri ? 'Download video' : 'Clip download is disabled in the web version' }
  class="rounded-sm p-2 transition duration-300 ease-in-out group
          { !isTauri ? 'cursor-not-allowed' : '' }
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