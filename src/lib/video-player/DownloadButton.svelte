<script lang="ts">
  import { listen } from '@tauri-apps/api/event';
  import { Download } from 'lucide-svelte';

  import { onMount } from 'svelte';

  import Progress from '$lib/Progress.svelte';
  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    id: string,
    downloading: boolean,
    isTauri: boolean,
    handleClick: () => Promise<void>,
  }

  let { id, downloading, isTauri, handleClick }: Props = $props();
  let progress = $state(0);

  onMount(() => {
    let unlisten: (() => void) | null = null;
    listen(id, ({ payload }: { payload: number }) => {
      progress = payload;
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      if (unlisten) unlisten();
    };
  });
</script>

<button
  type="button"
  disabled={!isTauri || downloading}
  aria-label="Download video"
  onclick={handleClick}
  title={ isTauri ? 'Download video' : 'Clip download is disabled in the web version' }
  class="rounded-sm p-2 transition duration-300 ease-in-out group
          { !isTauri ? 'cursor-not-allowed' : '' }
          { downloading ?
            'bg-black outline cursor-not-allowed' :
            'bg-(--primary) hover:bg-black hover:outline hover:scale-120'}"
>
  <div class="size-8">
    {#if !downloading}
    <Download class="size-full text-black group-hover:text-white" />
    {:else if progress > 0}
    <Progress {progress} />
    {:else}
    <Spinner />
    {/if}
  </div>
</button>