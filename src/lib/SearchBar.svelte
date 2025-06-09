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
  let focus = $state(false);

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
  class="relative w-96 h-12 p-1 gap-2 flex flex-row items-center
    transition-margin delay-100 duration-600 ease-in-out
    { channelRef ? 'mt-6' : 'my-8' }"
>
  <div class="absolute inset-0 rounded-md py-3 bg-[#242428]/70"></div>
  <div class="size-8 ml-4 z-1">
    {#if searching}
    <div class="mt-0.5">
      <Spinner />
    </div>
    {:else}
    <Search class="size-full" />
    {/if}
  </div>
  <input
    bind:value
    minlength=3
    maxlength=20
    type="search"
    name="searchbar"
    spellcheck=false
    autocomplete="off"
    oninput={onInput}
    onfocusin={() => focus = true}
    onfocusout={() => focus = false}
    placeholder="Search channel..."
    class="outline-none h-full w-[80%] ml-2 mr-5 text-2xl/5 p-1 z-2 font-bold"
  />
  <div class="absolute inset-0 rounded-sm py-3 z-1
    transition-[outline-width, outline-color, drop-shadow] duration-500 ease-in-out
    { focus ?
      'outline-2 outline-(--primary) drop-shadow-lg/100 drop-shadow-(color:--primary)' :
      'outline' 
    }"
  ></div>
</div>