<script lang="ts">
  import { fade } from 'svelte/transition';
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
  let player: HTMLVideoElement;

  onMount(() => {
    import('hls.js').then(module => {
      let hls = null;
      if (module.default.isSupported()) {
        hls = new module.default();
        hls.loadSource(videoUrl);
        hls.attachMedia(player);
      }
      return () => {
        if (hls) hls.destroy();
      };
    });
  });
</script>

<div class="h-[75dvh] max-h-[75dvh] aspect-[16/9] rounded-sm drop-shadow-lg/80 drop-shadow-(color:--primary)">
  <div class="absolute inset-0">
    <video
      bind:this={player}
      poster={posterUrl}
      controls={loaded}
      playsinline
      onloadeddata={() => { loaded = true }}
      class="absolute object-cover rounded-sm">
      <track kind="captions" default />
    </video>
    {#if !loaded}
    <img
      src={posterUrl}
      alt="Clip thumbnail"
      width="100%"
      height="100%"
      out:fade={{ duration: 500 }}
      class="absolute object-cover rounded-sm brightness-70 grayscale"/>
    <div
      out:fade={{ duration: 400 }}
      class="absolute w-[20%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </div>
    {/if}
  </div>
</div>