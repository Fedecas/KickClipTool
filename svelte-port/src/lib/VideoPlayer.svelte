<script lang="ts">
  import { onMount } from 'svelte';
  import videojs from 'video.js';
  import 'video.js/dist/video-js.css';
  import { X } from 'lucide-svelte';

  let { src = $bindable() } = $props();

  let videoElement: HTMLMediaElement;

  onMount(() => {
    const player = videojs(videoElement, {});

    return () => {
      if (player) player.dispose();
    };
  });
</script>

<div class="fixed inset-0 flex justify-center items-center z-4">
  <div class="absolute inset-0 backdrop-blur-sm"></div>
  <button
    type="button"
    class="absolute top-5 right-5 bg-(--primary) rounded-md p-2 hover:bg-black/70"
    onclick={() => src = ''}>
    <X class="text-black hover:text-white" />
  </button>
  <video
    bind:this={videoElement}
    class="video-js vjs-default-skin max-w-[75%] max-h-[75%]"
    controls
    preload="auto">
    <source src={src} type="application/x-mpegURL" />
    <track kind="captions" srclang="en" label="English" default />
  </video>
</div>
