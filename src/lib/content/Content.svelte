<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { ClipRef } from '$lib/types';
  import Channel from './Channel.svelte';
  import Sort from './Sort.svelte';
  import Clip from './Clip.svelte';
  import Message from '$lib/Message.svelte';

  import { getSearchBarState } from '$lib/SearchBarState.svelte';
  import { getChannelState } from '$lib/ChannelState.svelte';
  import { getContentState } from '$lib/ContentState.svelte';
  import { getClipState } from '$lib/ClipState.svelte';
  import { notif } from '$lib/notifications';

  const COOLDOWN_MS = 1000;
  const THRESHOLD_PX = 250;

  const searchBarState = getSearchBarState();
  const channelState = getChannelState();
  const clipState = getClipState();
  const self = getContentState();

  let triggered = false;
  let lastScrolledTo = 0;
  let scrollElement: HTMLElement;
  let timeoutId: ReturnType<typeof setTimeout>;
  let beforeHasResults = false;
  let lastChannel = '';

  $effect(() => {
    if (self.hasResults && !beforeHasResults) {
      scrollElement.scrollTo({ top: 0 });
    }
    beforeHasResults = self.hasResults;
  });

  async function handleChannelClick(channel: string): Promise<void> {
    lastChannel = channel;
    channelState.selected = true;
    await searchBarState.searchClips(channel);
  }

  function handleClipClick(ref: ClipRef): void {
    console.log('click clip', ref);
    //clipRef = ref;
  }

  async function handleScroll(): Promise<void> {
    if (!channelState.selected || !scrollElement) return;
    const scrolledTo = scrollElement.scrollTop + scrollElement.clientHeight;
    const isGoingDown = scrolledTo > lastScrolledTo;
    const shouldTrigger = scrolledTo >= (scrollElement.scrollHeight - THRESHOLD_PX);
    if (isGoingDown && shouldTrigger && !triggered) {
      triggered = true;
      if (self.clipState?.endReached) {
        notif.success('No more clips');
      } else {
        await clipState.more();
      }
      timeoutId = setTimeout(() => { triggered = false; }, COOLDOWN_MS);
    }
    lastScrolledTo = scrolledTo;
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div class="w-full min-h-0 flex flex-col flex-1 m-3 {self.hasResults ? '' : 'hidden'}">
  {#if channelState.selected}
  <Sort selectSort={clipState.selectSort} />
  {/if}
  <div
    bind:this={scrollElement}
    onscroll={handleScroll}
    class="outline overflow-y-auto size-full flex-1 bg-gray-950"
  >
    <div class="m-3 p-2 items-center gap-2 grid grid-cols-2
      md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      {#if !channelState.selected}
        {#each channelState.channels as channel}
        <Channel channel={channel} handleClick={handleChannelClick} />
        {/each}
      {:else}
        {#each clipState.clips as clip}
        <Clip clip={clip} handleClick={handleClipClick} />
        {/each}
      {/if}
    </div>
  </div>
</div>
{#if searchBarState.firstSearch && !self.hasResults && !searchBarState.searching}
<Message text="no results found :(" />
{/if}