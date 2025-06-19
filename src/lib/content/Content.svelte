<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { ChannelObject, ChannelRef, ClipObject, ClipRef } from '$lib/types';
  import Channel from './Channel.svelte';
  import Sort from './Sort.svelte';
  import Clip from './Clip.svelte';

  import { getContentState } from '$lib/Content-state.svelte';
  import { getSearchBarState } from '$lib/SearchBar-state.svelte';

  const COOLDOWN_MS = 1000;
  const THRESHOLD_PX = 250;

  const self = getContentState();
  const searchBar = getSearchBarState();

  let triggered = false;
  let lastScrolledTo = 0;
  let scrollElement: HTMLElement;
  let timeoutId: ReturnType<typeof setTimeout>;
  let beforeHasResults = false;
  let channelRef: ChannelRef;

  $effect(() => {
    if (self.hasResults && !beforeHasResults) {
      scrollElement.scrollTo({ top: 0 });
    }
    beforeHasResults = self.hasResults;
  });

  async function handleChannelClick(ref: ChannelRef): Promise<void> {
    channelRef = ref;
    await searchBar.searchClips(channelRef);
  }

  function handleClipClick(ref: ClipRef): void {
    console.log('click channel', ref);
    //clipRef = ref;
  }

  async function handleScroll(): Promise<void> {
    if (!self.channelSelected || !scrollElement) return;
    const scrolledTo = scrollElement.scrollTop + scrollElement.clientHeight;
    const isGoingDown = scrolledTo > lastScrolledTo;
    const shouldTrigger = scrolledTo >= (scrollElement.scrollHeight - THRESHOLD_PX);
    if (isGoingDown && shouldTrigger && !triggered) {
      triggered = true;
      await searchBar.searchClips(channelRef);
      timeoutId = setTimeout(() => { triggered = false; }, COOLDOWN_MS);
    }
    lastScrolledTo = scrolledTo;
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div class="w-full min-h-0 flex flex-col flex-1 m-3 {self.hasResults ? '' : 'hidden'}">
  {#if self.channelSelected}
  <Sort bind:sort={self.sort} />
  {/if}
  <div
    bind:this={scrollElement}
    onscroll={handleScroll}
    class="outline overflow-y-auto size-full flex-1 bg-gray-950"
  >
    <div class="m-3 p-2 items-center gap-2 grid grid-cols-2
      md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      {#if !self.channelSelected}
        {#each self.channels as channel}
        <Channel channel={(channel as ChannelObject)} handleClick={handleChannelClick} />
        {/each}
      {:else}
        {#each self.clips as clip}
        <Clip clip={(clip as ClipObject)} handleClick={handleClipClick} />
        {/each}
      {/if}
    </div>
  </div>
</div>