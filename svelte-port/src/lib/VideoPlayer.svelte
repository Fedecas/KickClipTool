<script lang="ts">
  import { onMount } from 'svelte';
  import { X, Download } from 'lucide-svelte';
  import videojs from 'video.js';

  const STREAM: string = 'https://clips.kick.com';

  let { ref = $bindable(null) } = $props();
  let posterUrl: string = $derived(`${STREAM}/clips/${ref.id}/${ref.name}/thumbnail.webp`);
  let videoUrl: string = $derived(`${STREAM}/clips/${ref.id}/${ref.name}/playlist.m3u8`);
  let downloadUrl: string = $derived(`${STREAM}/tmp/${ref.name}.mp4`);
  let loaded: boolean = $state(false);

  onMount(() => {
    const player = videojs('player');

    return () => {
      if (player) player.dispose();
    };
  });
</script>

<div class="fixed flex flex-col inset-0 justify-center items-center backdrop-blur-sm z-4">
  <video
    id="player"
    class="video-js max-w-[75vw] max-h-[75vh]"
    poster={posterUrl}
    controls={loaded}
    playsinline
    onloadeddata={() => {loaded = true}}
    autoplay>
    <source
      src={videoUrl}
      type="application/x-mpegURL" />
    <track kind="captions" default />
  </video>
  <div class="group">
    <button
      type="button"
      aria-label="Close video"
      onclick={() => ref = null}
      class="absolute top-30 right-20 bg-(--primary) rounded-md p-2 group-hover:bg-black/50">
      <X class="text-black group-hover:text-white" />
    </button>
  </div>
  <a
    href={downloadUrl}
    download
    class="group">
    <button
      type="button"
      aria-label="Download video"
      class="absolute top-50 right-20 bg-(--primary) rounded-md p-2 group-hover:bg-black/50">
      <Download class="text-black group-hover:text-white" />
    </button>
  </a>
</div>

<style>
</style>