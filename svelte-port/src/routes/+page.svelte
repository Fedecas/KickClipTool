<script lang="ts">
  import { searchChannel } from '$lib/api';
  import Logo from '$lib/Logo.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import SearchResults from '$lib/SearchResults.svelte';

  let value: string = $state('');
  let clicked: any = $state({});
  let channels: any[] = $state([]);
  let searching: boolean = $state(false);
  let hasResults: boolean = $derived(channels.length > 0);
  
  let timeout: number = 0;

  $effect(() => {
      if (clicked) {
        channels = [];

        const user: any = clicked?.user || {};
        value = user.username || '';
      }
    }
  )

  async function debounce_search() {
    searching = true;
    channels = [];
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(handle_search, 300);
  }

  async function handle_search() {
    channels = await searchChannel(value);
    searching = false;
  }
</script>

{@debug value}

<div class ="flex flex-col max-h-screen items-center">
  <Logo {hasResults} />
  <SearchBar bind:value {searching} handle_search={debounce_search} {hasResults} />
  <SearchResults {channels} {hasResults} bind:clicked/>
  {#if !hasResults}
  <h1>no results found</h1>
  {/if}
</div>