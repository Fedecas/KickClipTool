<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { ClipObject } from '$lib/types';
  import Channel from './Channel.svelte';
  import Sort from './Sort.svelte';
  import Clip from './Clip.svelte';
  import Message from '$lib/Message.svelte';
  import { ContentState, getContentState } from '$lib/ContentState.svelte';
  import { notif } from '$lib/notifications';
  import VideoPlayer from '$lib/video-player/VideoPlayer.svelte';

  const COOLDOWN_MS = 1000;
  const THRESHOLD_PX = 250;

  const self: ContentState = getContentState();
  const selectSort = self.selectSort;
  let channels = $derived(self.channelState?.channels ?? []);
  let clips = $derived(self.clipState?.clips ?? []);
  let video = $derived(self.video);
  let hasResults = $derived(self.hasResults);
  let firstSearch = $derived(self.firstSearch);
  let searching = $derived(self.searching);
  let channelSelected = $derived(self.channelSelected);

  let triggered = false;
  let lastScrolledTo = 0;
  let scrollElement: HTMLElement;
  let timeoutId: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (hasResults) scrollElement.scrollTo({ top: 0 });
  });

  async function handleScroll(): Promise<void> {
    if (!channelSelected || !scrollElement) return;
    const scrolledTo = scrollElement.scrollTop + scrollElement.clientHeight;
    const isGoingDown = scrolledTo > lastScrolledTo;
    const shouldTrigger = scrolledTo >= (scrollElement.scrollHeight - THRESHOLD_PX);
    if (isGoingDown && shouldTrigger && !triggered) {
      triggered = true;
      const hasMore = await self.moreClips();
      if (!hasMore) notif.success('No more clips');
      timeoutId = setTimeout(() => { triggered = false; }, COOLDOWN_MS);
    }
    lastScrolledTo = scrolledTo;
  }

  async function handleChannelClick(channel: string): Promise<void> {
    await self.searchClips(channel);
  }

  function handleClipClick(clipData: ClipObject): void {
    self.playVideo(clipData);
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div class="w-full min-h-0 flex flex-col flex-1 m-3
  transition-hidden duration-300 ease-in-out
  { hasResults ? '' : 'hidden' }"
>
  {#if channelSelected}
  <Sort {selectSort} />
  {/if}
  <div
    bind:this={scrollElement}
    onscroll={handleScroll}
    class="outline overflow-y-auto size-full flex-1 bg-gray-950"
  >
    <div class="m-3 p-2 items-center gap-2 grid grid-cols-2
      md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      {#if !channelSelected}
        {#each channels as channel}
        <Channel channel={channel} handleClick={handleChannelClick} />
        {/each}
      {:else}
        {#each clips as clip}
        <Clip clip={clip} handleClick={handleClipClick} />
        {/each}
      {/if}
    </div>
  </div>
</div>
{#if !hasResults && firstSearch && !searching}
<Message text="no results found :(" />
{:else if video}
<VideoPlayer clipData={video} />
{/if}