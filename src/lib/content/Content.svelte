<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { ChannelObject, ChannelRef, ClipObject, ClipRef } from '$lib/types';
  import Channel from './Channel.svelte';
  import Clip from './Clip.svelte';

  interface Props {
    results: ClipObject[] | ChannelObject[],
    hasResults: boolean,
    channelRef: ChannelRef | null,
    getClips: (channel: ChannelRef) => Promise<void>,
    clipRef: ClipRef | null
  }

  // Constants
  const COOLDOWN_MS = 1000;
  const THRESHOLD_PX = 250;

  // Runes
  let { results, hasResults, channelRef, getClips, clipRef = $bindable() }: Props = $props();

  // Internal
  let triggered = false;
  let lastScrolledTo = 0;
  let scrollElement: HTMLElement;
  let timeoutId: ReturnType<typeof setTimeout>;
  let lastResultLen = 0;

  $effect(() => {
    if (results.length > 0 && lastResultLen === 0) {
      scrollElement.scrollTo({ top: 0 });
    }
    lastResultLen = results.length;
  });

  async function handleChannelClick(channel: ChannelRef): Promise<void> {
    await getClips(channel);
  }

  function handleClipClick(ref: ClipRef): void {
    clipRef = ref;
  }

  async function handleScroll(): Promise<void> {
    if (!channelRef || !scrollElement) return;
    const scrolledTo = scrollElement.scrollTop + scrollElement.clientHeight;
    const isGoingDown = scrolledTo > lastScrolledTo;
    const shouldTrigger = scrolledTo >= (scrollElement.scrollHeight - THRESHOLD_PX);
    if (isGoingDown && shouldTrigger && !triggered) {
      triggered = true;
      await getClips(channelRef);
      timeoutId = setTimeout(() => { triggered = false; }, COOLDOWN_MS);
    }
    lastScrolledTo = scrolledTo;
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div
  bind:this={scrollElement}
  class="outline w-full m-3 overflow-y-auto bg-gray-950 {hasResults ? '' : 'hidden'}"
  onscroll={handleScroll}>
  <div class="m-3 p-2 items-center gap-2 grid grid-cols-2
              md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
    {#if !channelRef}
      {#each results as channel}
      <Channel channel={(channel as ChannelObject)} handleClick={handleChannelClick} />
      {/each}
    {:else}
      {#each results as clip}
      <Clip clip={(clip as ClipObject)} handleClick={handleClipClick} />
      {/each}
    {/if}
  </div>
</div>