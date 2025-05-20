<script lang="ts">
  import { fly } from 'svelte/transition';
  
  import type { ClipRef } from '$lib/types';

  import DownloadButton from './DownloadButton.svelte';
  import VideoElement from './VideoElement.svelte';
  import CloseButton from './CloseButton.svelte';
  import WebButton from './WebButton.svelte';

  interface Props {
    ref: ClipRef | null;
  }

  // Runes
  let { ref = $bindable() }: Props = $props();

  // Internal
  const id = ref?.id || '';
  const title = ref?.title || '';
  const videoUrl = ref?.video || '';
  const posterUrl = ref?.thumbnail || '';
  const channel = ref?.channel || '';
  const webUrl = ref ? `https://kick.com/${channel}/clips/${id}` : '';
</script>

<div
  in:fly={{ y: 500, duration: 500 }}
  out:fly={{ y: -500, duration: 500 }}
  class="absolute flex flex-row inset-0 items-center justify-center
         backdrop-blur-sm bg-linear-[black,transparent,black] z-4">
  <h1 class="absolute top-10 left-15 text-3xl font-bold max-w-[90dvw] truncate">
    {title}
  </h1>
  <VideoElement {posterUrl} {videoUrl} />
  <div class="absolute flex flex-col justify-center items-center gap-4 w-24 p-5 bg-black/70 right-8 rounded-sm">
    <CloseButton bind:ref />
    <DownloadButton {id} url={videoUrl} />
    <WebButton web={webUrl} />
  </div>
</div>