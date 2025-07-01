<script lang="ts">
  import { Download } from 'lucide-svelte';

  import { onMount } from 'svelte';

  import Progress from '$lib/Progress.svelte';
  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    id: string,
    isDownloading: boolean,
    canDownload: boolean,
    handleClick: () => Promise<void>,
  }

  let { id, isDownloading, canDownload, handleClick }: Props = $props();
  let progress = $state(0);

  onMount(() => {
    let unlisten: (() => void) | null = null;
    if (canDownload) {
      const setupDownloadListener = async () => {
        const { listen } = await import('@tauri-apps/api/event');
        const unlisten = await listen<number>(id, ({ payload }) => {
          progress = payload;
        });

        return unlisten;
      }

      setupDownloadListener().then((fn) => {
        unlisten = fn;
      }).catch((err) => {
        console.error('Error trying to configure download listener', err);
      });
    }
    return () => {
      if (unlisten) unlisten();
    };
  });
</script>

<button
  type="button"
  disabled={!canDownload || isDownloading}
  aria-label="Download video"
  onclick={handleClick}
  title={canDownload ? 'Download video' : 'Clip download is disabled in the web version'}
  class="rounded-sm p-2 transition duration-300 ease-in-out group
    { !canDownload ? 'cursor-not-allowed' : '' }
    { isDownloading ?
      'bg-black outline cursor-not-allowed' :
      'bg-(--primary) hover:bg-black hover:outline hover:scale-120'}"
>
  <div class="size-8">
    {#if !isDownloading}
    <Download class="size-full text-black group-hover:text-white" />
    {:else if progress > 0}
    <Progress {progress} />
    {:else}
    <Spinner />
    {/if}
  </div>
</button>