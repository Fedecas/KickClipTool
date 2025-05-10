<script lang="ts">
  import { Search } from 'lucide-svelte';

  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    value: string,
    searching: boolean,
    hasResults: boolean,
    onInput: (value: string) => void
  }

  // Runes
  let { value, searching, hasResults, onInput }: Props = $props();

  // Internal
  let timeout: number = 0;

  function handleInput(): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(onInput, 300, value);
  }
</script>

<div class="relative w-96 min-h-12 {hasResults ? 'my-2' : 'my-16'}">
  <input
    class="absolute outline-0 pl-16 size-full top-0 z-1"
    placeholder="Search channel..."
    type="search"
    bind:value
    oninput={() => handleInput()}
  />
  <div
  class="absolute outline-2 size-full rounded-3xl py-3 transition-all
  focus:outline-(--primary) focus:outline-3 focus:drop-shadow-xl focus:drop-shadow-(color:--primary)">
  </div>
  <div class="absolute ml-5 top-2.5 size-7">
    {#if searching}
    <Spinner />
    {:else}
    <Search class="size-full" />
    {/if}
  </div>
</div>

<style>
  input:focus + div {
    outline: 3px solid var(--primary);
    filter: drop-shadow(0 6px 4px var(--primary));
  }
</style>