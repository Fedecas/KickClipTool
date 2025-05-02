<script lang="ts">
	import { searchChannel } from './lib/api';
  import Logo from './lib/Logo.svelte';
  import SearchBar from './lib/SearchBar.svelte';
  import SearchResults from './lib/SearchResults.svelte';

  let value: string = $state('')
  let searching: boolean = $state(false)
  let products: any[] = $state([])
  let hasResults: boolean = $derived(products.length > 0)

  async function handle_search() {
    searching = true
    if (value.length > 0) {
      searchChannel(value).then((response: any) => {
        products = response
      }).catch((error: any) => {
        console.error('Error fetching products:', error)
      }).finally(() => {
        searching = false
      })
    } else {
      products = []
      searching = false
    }
  }
</script>

<div class ="flex flex-col max-h-screen items-center">
  <Logo {hasResults} />
  <SearchBar bind:value {searching} {handle_search} {hasResults} />
  <SearchResults {products} {hasResults} />
</div>