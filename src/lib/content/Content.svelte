<script lang="ts">
  import { onDestroy } from 'svelte';

  import Message from '$lib/Message.svelte';
  import { notif } from '$lib/notifications';
  import VideoPlayer from '$lib/video-player/VideoPlayer.svelte';
  import { getVideoState, VideoState } from '$lib/video-player/VideoState.svelte';
  import type { ChannelObject, ClipObject } from '$lib/types';

  import Channel from './Channel.svelte';
  import Clip from './Clip.svelte';
  import Sort from './Sort.svelte';
  import { ContentState, getContentState } from './ContentState.svelte';

  const COOLDOWN_MS = 1000;
  const THRESHOLD_PX = 250;

  const content: ContentState = getContentState();
  const channels: ChannelObject[] = $derived(content.channelState?.channels ?? []);
  const clips: ClipObject[] = $derived(content.clipState?.clips ?? []);
  const handleChannelClick = content.searchClips;
  const selectSort = content.selectSort;

  const video: VideoState = getVideoState();
  const handleClipClick = video.open;

  let lastScrolledTo: number = 0;
  let scrollElement: HTMLElement;
  let timeoutId: ReturnType<typeof setTimeout>;
  let triggered: boolean = false;

  $effect(() => {
    if (content.hasResults) scrollElement.scrollTo({ top: 0 });
  });

  const handleScroll = async (): Promise<void> => {
    if (!content.channelSelected || !scrollElement) return;
    const scrolledTo = scrollElement.scrollTop + scrollElement.clientHeight;
    const isGoingDown = scrolledTo > lastScrolledTo;
    const shouldTrigger = scrolledTo >= (scrollElement.scrollHeight - THRESHOLD_PX);
    if (isGoingDown && shouldTrigger && !triggered) {
      triggered = true;
      const hasMore = await content.moreClips();
      if (!hasMore) notif.success('No more clips');
      timeoutId = setTimeout(() => { triggered = false; }, COOLDOWN_MS);
    }
    lastScrolledTo = scrolledTo;
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div class="w-full min-h-0 flex flex-col flex-1 m-3
  transition-hidden duration-300 ease-in-out
  { content.hasResults ? "" : "hidden" }"
>
  {#if content.channelSelected}
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
      {#if !content.channelSelected}
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
{#if !content.hasResults && content.firstSearch && !content.searching}
<Message text="no results found :(" />
{:else if content.playing}
<VideoPlayer />
{/if}