<script lang="ts">
  import type Hls from 'hls.js';

  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  import Spinner from '$lib/Spinner.svelte';
  import { initHLS } from './video';

  interface Props {
    posterUrl: string;
    videoUrl: string;
    downloading: boolean;
  }

  // Runes
  let { posterUrl, videoUrl, downloading }: Props = $props();
  let loaded = $state(false);
  let hls: Hls | null = $state(null);

  // Internal
  let videoElement: HTMLVideoElement;

  $effect(() => {
    downloading ? hls?.stopLoad() : hls?.startLoad();
  });

  onMount(() => {
    hls = initHLS(videoElement, videoUrl);
    return () => {
      hls?.destroy();
      hls = null;
    };
  });
</script>

<div class="absolute h-[75dvh] w-[75dvw] aspect-video rounded-sm
            drop-shadow-lg/80 flex items-center justify-center"
>
  <video
    bind:this={videoElement}
    controls={loaded}
    playsinline
    preload="auto"
    oncanplaythrough={() => { loaded = true }}
    class="h-full w-auto object-contain rounded-sm"
  >
    <track kind="captions" default />
  </video>
  {#if !loaded}
  <div
    out:fade={{ duration: 400 }}
    class="absolute flex items-center justify-center bg-black/40"
  >
    <img
      src={posterUrl}
      alt="Clip poster"
      class="object-cover rounded-sm brightness-70 grayscale"
    />
    <div class="absolute w-[20%]">
      <Spinner />
    </div>
  </div>
  {/if}
</div>