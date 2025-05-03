<script lang="ts">
  import { searchChannel } from '$lib/api';
  import Logo from '$lib/Logo.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import SearchResults from '$lib/SearchResults.svelte';

  let value: string = $state('')
  let products: any[] = $state([])
  let searching: boolean = $state(false)
  let hasResults: boolean = $derived(products.length > 0)

  let timeout: number = 0

  async function debounce_search() {
    searching = true
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(handle_search, 300)
  }

  async function handle_search() {
    try {
      products = await searchChannel(value)
    } catch (error) {
      console.error('Error fetching products:', error)
    }

    searching = false
  }
</script>

<div class ="flex flex-col max-h-screen items-center">
  <Logo {hasResults} />
  <SearchBar bind:value {searching} handle_search={debounce_search} {hasResults} />
  <SearchResults {products} {hasResults} />
</div>