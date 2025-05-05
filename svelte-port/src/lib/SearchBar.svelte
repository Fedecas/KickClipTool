<script lang="ts">
  import { Search } from 'lucide-svelte';
  import Spinner from '$lib/Spinner.svelte';

  let { value, searching, hasResults, onInput } = $props();
  let timeout: number = 0;

  function handleInput(): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(onInput, 300, value);
  }
</script>

<span class="outline relative flex flex-row">
  <input
    class="card outline-2 rounded-3xl w-96 transition-all text-lg py-3 pl-16
    focus:outline-(--primary) focus:outline-3 focus:drop-shadow-xl focus:drop-shadow-(color:--primary)
    {hasResults ? 'my-2' : 'my-16'}"
    placeholder="Search channel..."
    type="search"
    bind:value
    oninput={() => handleInput()}
  />
  <span class="absolute left-4 self-center">
    {#if searching}
    <Spinner />
    {:else}
    <Search />
    {/if}
  </span>
</span>