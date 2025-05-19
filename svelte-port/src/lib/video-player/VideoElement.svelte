<script lang="ts">
  import { fade, blur } from 'svelte/transition';
  import { onMount } from 'svelte';

  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    posterUrl: string;
    videoUrl: string;
  }

  // Runes
  let { posterUrl, videoUrl }: Props = $props();
  let loaded = $state(false);

  // Internal
  let videoElement: HTMLVideoElement;

  onMount(() => {
    import('hls.js').then(module => {
      let hls = null;
      if (module.default.isSupported()) {
        hls = new module.default();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);
      }
      return () => {
        if (hls) hls.destroy();
      };
    });
  });
</script>

<div class="absolute max-h-[75dvh] aspect-[16/9] rounded-sm
            drop-shadow-lg/80 drop-shadow-(color:--primary)
            flex items-center justify-center">
  <video
    bind:this={videoElement}
    controls={loaded}
    playsinline
    onloadeddata={() => { loaded = true }}
    class="size-full object-cover rounded-sm">
    <track kind="captions" default />
  </video>
  {#if !loaded}
  <img
    src={posterUrl}
    alt="Clip poster"
    width="100%"
    height="100%"
    out:fade={{ duration: 500 }}
    class="absolute size-full object-cover rounded-sm brightness-70 grayscale"/>
  <div
    out:fade={{ duration: 400 }}
    class="absolute w-[20%]">
    <Spinner />
  </div>
  {/if}
</div>