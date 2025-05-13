<script lang="ts">
  import type { ChannelObject, ClipObject, ChannelRef, ClipRef, ClipsResponse } from '$lib/types';
  import { searchChannels, searchClips } from '$lib/api';
  import SearchResults from '$lib/SearchResults.svelte';
  import VideoPlayer from '$lib/VideoPlayer.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import Message from '$lib/Message.svelte';
  import Logo from '$lib/Logo.svelte';

  // Runes
  let searching: boolean = $state(false);
  let firstSearch: boolean = $state(false);
  let clipRef: ClipRef | null = $state(null);
  let channelRef: ChannelRef | null = $state(null);
  let results: ClipObject[] | ChannelObject[] = $state([]);
  let hasResults: boolean = $derived(results.length > 0);
  // @ts-ignore
  let endReached: boolean = $derived(channelRef !== null && channelRef.nextCursor === '');

  async function handleSearchClips(channel: ChannelRef): Promise<void> {
    if (endReached) return;
    searching = true;

    if (channelRef !== channel) {
      channelRef = channel;
      results = [];
    }

    const slug = channelRef.slug;
    const cursor = channelRef.nextCursor || '';
    const res: ClipsResponse = await searchClips(slug, cursor);
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

<div class ="flex flex-col max-h-screen items-center">
  <Logo {hasResults} />
  <SearchBar {searching} {hasResults} {channelRef} handleInput={handleSearchChannels} />
  <SearchResults {results} {hasResults} {channelRef} getClips={handleSearchClips} bind:clipRef />
  {#if clipRef}
  <VideoPlayer bind:ref={clipRef} />
  {/if}
  {#if firstSearch && !hasResults && !searching}
  <Message text="no results found" />
  {/if}
</div>