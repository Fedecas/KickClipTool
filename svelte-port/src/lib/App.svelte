<script lang="ts">
  import { searchChannels, searchClips } from '$lib/api';
  import Logo from '$lib/Logo.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import SearchResults from '$lib/SearchResults.svelte';
  import VideoPlayer from '$lib/VideoPlayer.svelte';

  let searchField: string = $state('');
  let searching: boolean = $state(false);
  let selected: string = $state('');
  let results: any[] = $state([]);
  let hasResults: boolean = $derived(results.length > 0);
  let clipUrl: string = $state('');

  let endReached: boolean = false;
  let nextCursor: string = '';

  async function handle_search_clips(channel: any) {
    if (!endReached) {
      searching = true;
      if (selected !== channel.slug) {
        selected = channel.slug;
        searchField = channel.name;
        results = [];
      }
  
      const res = await searchClips(selected, nextCursor);
      results = [...results, ...res?.clips];
      nextCursor = res?.nextCursor;
  
      if (!nextCursor) {
        endReached = true;
      }
  
      searching = false;
    }
  }

  async function handle_search_channels(channel: string) {
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
  <SearchBar value={searchField} {searching} {hasResults} onInput={handle_search_channels} />
  <SearchResults {results} {hasResults} {selected} getClips={handle_search_clips} bind:clipUrl={clipUrl} />
  {#if clipUrl}
    <VideoPlayer bind:src={clipUrl} />
  {/if}
</div>