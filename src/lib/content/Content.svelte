<script lang="ts">
  import { onDestroy } from 'svelte';

  import Channel from './Channel.svelte';
  import Clip from './Clip.svelte';
  import Message from '$lib/Message.svelte';
  import Sort from './Sort.svelte';
  import VideoPlayer from '$lib/video-player/VideoPlayer.svelte';
  
  import { ContentState, getContentState } from './ContentState.svelte';
  import { notif } from '$lib/notifications';
  import { getVideoState, VideoState } from '$lib/VideoState.svelte';

  const COOLDOWN_MS = 1000;
  const THRESHOLD_PX = 250;

  const content: ContentState = getContentState();
  const { firstSearch, playing, searching, channelSelected, hasResults, selectSort } = content;
  const channels = $derived(content.channelState?.channels ?? []);
  const clips = $derived(content.clipState?.clips ?? []);
  const handleChannelClick = content.searchClips;

  const video: VideoState = getVideoState();
  const handleClipClick = video.open;
  
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
{:else if playing}
<VideoPlayer />
{/if}