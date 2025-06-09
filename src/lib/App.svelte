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

<main class="flex flex-col items-center overflow-hidden
  min-w-[100px] w-dvw min-h-[600px] h-dvh bg-contain bg-gray-950
  bg-[linear-gradient(to_bottom,transparent,var(--color-gray-900)),url('/space.webp')]"
>
  <div class="w-full flex flex-col items-center">
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
