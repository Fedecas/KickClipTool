<script lang="ts">
  import type { ClipObject, ClipRef, ClipsResponse } from '$lib/types';
  import { searchChannels, searchClips } from '$lib/api';
  import Logo from '$lib/Logo.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import VideoPlayer from '$lib/VideoPlayer.svelte';
  import SearchResults from '$lib/SearchResults.svelte';

  // Runes
  let searchField: string = $state('');
  let searching: boolean = $state(false);
  let selected: string = $state('');
  let results: ClipObject[] | any[] = $state([]);
  let clipRef: ClipRef | null = $state(null);
  let hasResults: boolean = $derived(results.length > 0);

  // Internal
  let endReached: boolean = false;
  let nextCursor: string = '';

  async function handleSearchClips(channel: any) {
    if (!endReached) {
      searching = true;
      if (selected !== channel.slug) {
        selected = channel.slug;
        searchField = channel.name;
        results = [];
      }
  
      const res: ClipsResponse = await searchClips(selected, nextCursor);
      results = [...results, ...res.clips];
      nextCursor = res.nextCursor;
  
      if (!nextCursor) {
        endReached = true;
      }
  
      searching = false;
    }
  }

  async function handleSearchChannels(channel: string) {
    selected = '';
    searching = true;
    results = [];
    nextCursor = '';
    endReached = false;

    results = await searchChannels(channel);

    searching = false;
  }
</script>

<div class ="flex flex-col max-h-screen items-center">
  <Logo {hasResults} />
  <SearchBar value={searchField} {searching} {hasResults} onInput={handleSearchChannels} />
  <SearchResults {results} {hasResults} {selected} getClips={handleSearchClips} bind:clipRef />
  {#if clipRef}
    <VideoPlayer bind:ref={clipRef} />
  {/if}
</div>