<script lang="ts">
  import { Search } from 'lucide-svelte';

  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  import type { ChannelRef } from '$lib/types';
  import Spinner from '$lib/Spinner.svelte';

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
  class="relative w-96 h-12 p-1 gap-2 flex flex-row items-center mr-2
          {hasResults ? 'my-2' : 'my-16'}">
  <div class="absolute size-full rounded-3xl py-3 bg-[#242428]"></div>
  <div class="size-8 ml-5 z-1">
    {#if searching}
    <div class="mt-0.5">
      <Spinner />
    </div>
    {:else}
    <Search class="size-full" />
    {/if}
  </div>
  <input
    placeholder="Search channel..."
    type="search"
    name="searchbar"
    bind:value
    oninput={onInput}
    class="outline-0 h-full w-[80%] ml-1 mr-11 text-2xl p-1 z-2
            text-center focus:text-left"/>
  <div class="absolute outline-2 size-full rounded-3xl py-3 z-1>"></div>
</div>

<style>
  input:focus + div {
    outline: 3px solid var(--primary);
    filter: drop-shadow(0 6px 4px var(--primary));
  }
</style>