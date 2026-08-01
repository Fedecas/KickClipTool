<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { loadPlaylist } from './video';
  import type Hls from 'hls.js';
  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    thumbnail: string;
    url: string;
    isDownloading: boolean;
    canDownload: boolean;
    ext: string;
  }

  const { thumbnail, url, isDownloading, canDownload, ext }: Props = $props();
  let loaded = $state(false);
  let showPoster = $state(true);
  let videoElement: HTMLVideoElement;

  const markReady = () => {
    loaded = true;
    showPoster = false;
  };

  const setupVideo = (): Hls | null => {
    let hls: Hls | null = null;

    videoElement.addEventListener('loadeddata', markReady, { once: true });

    if (ext === 'm3u8') {
      loadPlaylist(videoElement, url, () => {}).then((res: Hls | null) => {
        hls = res;
      });

      if (canDownload) {
        $effect(() => {
          isDownloading && loaded ? hls?.stopLoad() : hls?.startLoad();
        });
      }
    } else {
      videoElement.src = url;
    }

    return hls;
  };

  onMount(() => {
    const hls = setupVideo();
    return () => {
      if (hls) hls.destroy();
    };
  });
</script>

<div
  class="absolute h-[75dvh] w-[75dvw] aspect-video rounded-sm
  drop-shadow-lg/80 flex items-center justify-center"
>
  <video
    bind:this={videoElement}
    controls={loaded}
    playsinline
    preload="auto"
    poster={showPoster ? thumbnail : undefined}
    class="h-full w-full object-contain rounded-sm bg-black"
  >
    <track kind="captions" default />
  </video>

  {#if !loaded}
    <div out:fade={{ duration: 400 }} class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-sm overflow-hidden">
      <img src={thumbnail} alt="Clip poster" class="w-full h-full object-cover brightness-70 grayscale" />
      <div class="absolute w-[20%]">
        <Spinner />
      </div>
    </div>
  {/if}
</div>
