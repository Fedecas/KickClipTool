<script lang="ts">
  import type { ChannelObject, ClipObject, ChannelRef, ClipRef } from '$lib/types';
  import VideoPlayer from '$lib/video-player/VideoPlayer.svelte';
  import { searchChannels, searchClips } from '$lib/api';
  import Content from '$lib/content/Content.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import Message from '$lib/Message.svelte';
  import Header from '$lib/Header.svelte';

  // Runes
  let downloads = $state([]);
  let searching = $state(false);
  let firstSearch = $state(false);
  let clipRef: ClipRef | null = $state(null);
  let channelRef: ChannelRef | null = $state(null);
  let results: ClipObject[] | ChannelObject[] = $state([]);
  let hasResults = $derived(results.length > 0);
  // @ts-ignore
  let endReached = $derived(channelRef !== null && channelRef.nextCursor === '');

  async function handleSearchClips(channel: ChannelRef): Promise<void> {
    if (endReached) return;
    searching = true;

    if (channelRef !== channel) {
      channelRef = channel;
      results = [];
    }

    const slug = channelRef.slug;
    const cursor = channelRef.nextCursor || '';
    const res = await searchClips(slug, cursor);
    results = [...(results as ClipObject[]), ...res.clips];
    channelRef.nextCursor = res.nextCursor;

    searching = false;
  }

  async function handleSearchChannels(channel: string): Promise<void> {
    searching = true;
    channelRef = null;
    results = [];
    
    results = await searchChannels(channel);
    
    searching = false;
    if (!firstSearch) firstSearch = true;
  }
</script>

<main class ="flex flex-col items-center max-w-[100dvw] h-[100dvh] min-h-[600px] max-h-screen ">
  <div class="w-full flex flex-col items-center space-background">
    <Header {hasResults} />
    <SearchBar {searching} {hasResults} {channelRef} handleInput={handleSearchChannels} />
  </div>
  <Content {results} {hasResults} {channelRef} getClips={handleSearchClips} bind:clipRef />
  {#if clipRef}
  <VideoPlayer bind:ref={clipRef} bind:downloads />
  {/if}
  {#if firstSearch && !hasResults && !searching}
  <Message text="no results found :(" />
  {/if}
</main>

<style>
  .space-background {
    background-color: var(--color-gray-950);
    background-image:
      linear-gradient(to bottom, transparent, var(--color-gray-900)),
      url('/space.webp');
  }
</style>