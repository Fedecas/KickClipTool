<script lang="ts">
  import { searchChannels, searchClips } from '$lib/api';
  import Logo from '$lib/Logo.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import SearchResults from '$lib/SearchResults.svelte';

  let searchField: string = $state('');
  let searching: boolean = $state(false);
  let selected: string = $state('');
  let results: any[] = $state([]);
  let hasResults: boolean = $derived(results.length > 0);

  let nextCursor: string = '';

  async function handle_search_clips(channel: any) {
    searchField = channel.name;
    selected = channel.slug;
    searching = true;
    results = [];

    const res = await searchClips(selected);
    results = res?.clips;
    nextCursor = res?.nextCursor;

    searching = false;
  }

  async function handle_search_channels(channel: string) {
    selected = '';
    searching = true;
    results = [];

    results = await searchChannels(channel);

    searching = false;
  }
</script>

<div class ="flex flex-col max-h-screen items-center">
  <Logo {hasResults} />
  <SearchBar value={searchField} {searching} {hasResults} onInput={handle_search_channels} />
  <SearchResults {results} {hasResults} {selected} onClick={handle_search_clips} />
  {#if !hasResults}
  <h1>no results found</h1>
  {/if}
</div>