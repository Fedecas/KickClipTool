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
  const COOLDOWN = 1000; // ms
  const THRESHOLD = 300; // px

  // Runes
  let { results, hasResults, channelRef, getClips, clipRef = $bindable() }: Props = $props();

  // Internal
  let triggered = false;
  let lastScrolledTo = 0;
  let timeoutId: ReturnType<typeof setTimeout>;

  async function handleChannelClick(channel: ChannelRef): Promise<void> {
    await getClips(channel);
  }

  function handleClipClick(ref: ClipRef): void {
    clipRef = ref;
  }

  async function handleScroll(e: UIEvent): Promise<void> {
    if (!channelRef) return;
    const target = e.currentTarget as HTMLDivElement;
    if (!target) return;
    const scrolledTo = target.scrollTop + target.clientHeight;
    const isGoingDown = scrolledTo > lastScrolledTo;
    const shouldTrigger = scrolledTo >= (target.scrollHeight - THRESHOLD);
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