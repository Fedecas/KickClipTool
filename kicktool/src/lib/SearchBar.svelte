<script lang="ts">
  import Spinner from './Spinner.svelte';
  import { Search } from 'lucide-svelte';

  let { value = $bindable(), searching, handle_search, hasResults } = $props()
</script>

<div class="relative">
  <input
    class="pepe outline-2 rounded-3xl w-96 transition-all text-lg py-3 pl-16 bg-black focus:outline-green-500 focus:outline-3 {hasResults ? 'my-6' : 'my-16'}"
    placeholder="Search channel"
    type="search"
    bind:value={value}
    oninput={handle_search}
  />
  <span class="absolute inset-y-0 left-4 flex items-center">
    {#if searching}
    <Spinner />
    {:else}
    <Search />
    {/if}
  </span>
</div>

<style>
  .pepe:focus {
    filter: drop-shadow(0 0 2rem #00ff00);
  }
</style>