<script lang="ts">
	import { searchChannel } from './lib/api';
  import Logo from './lib/Logo.svelte';
  import SearchBar from './lib/SearchBar.svelte';
  import SearchResults from './lib/SearchResults.svelte';

  let search: string = $state('')
  let searching: boolean = $state(false)
  let products: any[] = $state([])
  let hasResults: boolean = $derived(products.length > 0)

  async function handle_search() {
    searching = true
    if (search.length > 0) {
      searchChannel(search).then((response: any) => {
        products = response
      }).catch((error: any) => {
        console.error('Error fetching products:', error)
      })
    } else {
      products = []
    }
    searching = false
  }
</script>

<div class ="flex flex-col max-h-screen items-center">
  <Logo {hasResults} />
  <SearchBar bind:value={search} {searching} {handle_search} {hasResults}/>
  <SearchResults {products} {hasResults}/>
</div>