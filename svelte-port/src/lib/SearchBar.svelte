<script lang="ts">
  import { Search } from 'lucide-svelte';

  import type { ChannelRef } from '$lib/types';
  import Spinner from '$lib/Spinner.svelte';
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  interface Props {
    searching: boolean,
    hasResults: boolean,
    channelRef: ChannelRef | null,
    handleInput: (value: string) => Promise<void>
  }

  // Constants
  const TIMEOUT = 600; // ms

  // Runes
  let { searching, hasResults, channelRef, handleInput }: Props = $props();

  // Internal
  let value = $state('');
  let timeoutId: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (channelRef) {
      value = channelRef.name;
    }
  });

  function onInput(): void {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => { await handleInput(value); }, TIMEOUT);
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div
  in:fly={{ y: 500, duration: 1000 }}
  class="relative w-[20%] min-h-12 transition-margin duration-500 {hasResults ? 'my-2' : 'my-16'}">
  <input
    placeholder="Search channel..."
    type="search"
    bind:value
    oninput={onInput}
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