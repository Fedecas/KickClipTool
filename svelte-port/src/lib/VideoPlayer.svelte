<script lang="ts">
  import Hls from 'hls.js';
  import { X, Download } from 'lucide-svelte';
  
  import { onMount } from 'svelte';
  import Spinner from '$lib/Spinner.svelte';
  import type { ClipRef } from '$lib/types';

  interface Props {
    ref: ClipRef | null;
  }

  // Constants
  const STREAM: string = 'https://clips.kick.com';
  const WEB: string = 'https://kick.com';

  // Runes
  let { ref = $bindable() }: Props = $props();
  let loaded: boolean = $state(false);

  // Internal
  const title: string = ref?.title || '';
  const videoUrl: string = ref?.video || '';
  const posterUrl: string = ref?.thumbnail || '';
  const downloadUrl: string = ref ? `${STREAM}/tmp/${ref.id}.mp4` : '';
  const webUrl: string = ref ? `${WEB}/${ref.channel}/clips/${ref.id}` : '';
  let player: HTMLVideoElement;

  onMount(() => {
    let hls: Hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(player);
    }
    return () => {
      if (hls) hls.destroy();
    };
  });
</script>

<div class="absolute flex flex-row inset-0 items-center justify-center
            backdrop-blur-sm bg-linear-[black,transparent,black] z-4">
  <div class="shadow-xl shadow-(color:--primary) max-h-[75dvh] aspect-[16/9] rounded-md">
    <video
      bind:this={player}
      poster={posterUrl}
      controls={loaded}
      playsinline
      autoplay
      onloadeddata={() => loaded = true}
      class="object-cover rounded-md transition-all {loaded ? '' : 'grayscale'}">
      <track kind="captions" default />
    </video>
    {#if !loaded}
      <div class="absolute flex flex-col inset-0 justify-center items-center bg-black/70">
        <Spinner />
      </div>
    {/if}
  </div>
  <div class="absolute flex flex-col justify-center items-center gap-4 w-24 h-[25dvh] bg-black/70 right-8 rounded-md">
    <div class="group">
      <button
        type="button"
        aria-label="Close video"
        onclick={() => ref = null}
        class="bg-red-500 rounded-md p-2
               transition duration-300 ease-in-out
               group-hover:bg-black group-hover:outline group-hover:scale-120">
        <X class="size-8 text-black group-hover:text-white" />
      </button>
    </div>
    <a
      href={downloadUrl}
      target="_blank"
      download
      class="group">
      <button
        type="button"
        aria-label="Download video"
        class="bg-(--primary) rounded-md p-2
               transition duration-300 ease-in-out
               group-hover:bg-black group-hover:outline group-hover:scale-120">
        <Download class="size-8 text-black group-hover:text-white" />
      </button>
    </a>
    <a
      href={webUrl}
      target="_blank"
      class="group">
      <button
        type="button"
        aria-label="See on website"
        class="bg-(--primary) rounded-md p-2
               transition duration-300 ease-in-out
               group-hover:bg-black group-hover:outline group-hover:scale-120">
        <img
          src="/kick-icon.ico"
          alt="Kick icon"
          class="size-8 group-hover:grayscale" />
      </button>
    </a>
  </div>
  <h1 class="absolute top-5 left-5 text-3xl font-bold">
    {title}
  </h1>
</div>
