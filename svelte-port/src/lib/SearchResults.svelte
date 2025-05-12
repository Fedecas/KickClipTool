<script lang="ts">
  import type { ChannelObject, ChannelRef, ClipObject, ClipRef } from '$lib/types';
  import Channel from '$lib/Channel.svelte';
  import Clip from '$lib/Clip.svelte';
  import { onDestroy } from 'svelte';

  interface Props {
    results: ClipObject[] | ChannelObject[],
    hasResults: boolean,
    channelRef: ChannelRef | null,
    getClips: (channel: ChannelRef) => Promise<void>,
    clipRef: ClipRef | null
  }

  // Constants
  const COOLDOWN: number = 1000; // ms
  const THRESHOLD: number = 300; // px

  // Runes
  let { results, hasResults, channelRef, getClips, clipRef = $bindable() }: Props = $props();

  // Internal
  let lastScrolledTo: number = 0;
  let triggered: boolean = false;
  let timeoutId: number = 0;

  async function handleChannelClick(channel: ChannelRef): Promise<void> {
    await getClips(channel);
  }

  function handleClipClick(ref: ClipRef): void {
    clipRef = ref;
  }

  async function handleScroll(e: UIEvent): Promise<void> {
    if (!channelRef) return;
    const target: HTMLDivElement = e.currentTarget as HTMLDivElement;
    if (!target) return;
    const scrolledTo: number = target.scrollTop + target.clientHeight;
    const isGoingDown: boolean = scrolledTo > lastScrolledTo;
    const shouldTrigger: boolean = scrolledTo >= (target.scrollHeight - THRESHOLD);
    if (isGoingDown && shouldTrigger && !triggered) {
      triggered = true;
      await getClips(channelRef);
      timeoutId = setTimeout(() => { triggered = false; }, COOLDOWN);
    }
    lastScrolledTo = scrolledTo;
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div
  class="outline size-full m-3 overflow-y-auto bg-gray-950 {hasResults ? '' : 'collapse'}"
  onscroll={handleScroll}>
  <div class="h-full m-3 p-2 grid grid-cols-6 gap-2">
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