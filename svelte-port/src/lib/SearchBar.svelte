<script lang="ts">
  import { Search } from 'lucide-svelte';

  import { fly } from 'svelte/transition';
  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    value: string,
    searching: boolean,
    hasResults: boolean,
    onInput: (value: string) => void
  }

  // Constants
  const TIMEOUT: number = 600; // ms

  // Runes
  let { value, searching, hasResults, onInput }: Props = $props();

  // Internal
  let timeout_id: number;

  function handleInput(): void {
    if (timeout_id) clearTimeout(timeout_id);
    timeout_id = setTimeout(onInput, TIMEOUT, value);
  }
</script>

<div
  in:fly={{ y: 500, duration: 1000 }}
  class="relative w-[20%] min-h-12 transition-margin duration-500 {hasResults ? 'my-2' : 'my-16'}">
  <input
    placeholder="Search channel..."
    type="search"
    bind:value
    oninput={handleInput}
    class="absolute outline-0 pl-16 size-full text-lg top-0.5 z-1"/>
  <div class="absolute outline-2 size-full rounded-3xl py-3 transition-all">
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