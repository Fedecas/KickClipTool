<script lang="ts">
  import { getSearchBarContext } from './SearchBar-state.svelte';
  import Spinner from '$lib/Spinner.svelte';
  import { fly } from 'svelte/transition';
  import { Search } from 'lucide-svelte';

  const self = getSearchBarContext();
  let focus = $state(true);
</script>

<div
  in:fly={{ y: 500, duration: 1000 }}
  class="relative w-96 h-12 p-1 gap-2 flex flex-row items-center
    transition-margin delay-100 duration-600 ease-in-out
    { self.selected ? 'mt-6' : 'my-8' }"
>
  <div class="absolute inset-0 rounded-md py-3 bg-[#242428]/70"></div>
  <div class="size-8 ml-4 z-10">
    {#if self.searching}
    <div class="mt-0.5">
      <Spinner />
    </div>
    {:else}
    <Search class="size-full" />
    {/if}
  </div>
  <input
    bind:value={self.value}
    minlength=3
    maxlength=20
    type="search"
    name="searchbar"
    spellcheck=false
    autocomplete="off"
    oninput={self.onInput}
    onfocusin={() => focus = true}
    onfocusout={() => focus = false}
    placeholder="Search channel..."
    class="outline-none h-full w-[80%] ml-2 mr-5 text-2xl/5 p-1 z-20 font-bold"
  />
  <div class="absolute inset-0 rounded-sm py-3 z-10
    transition-[outline-width, outline-color, drop-shadow] duration-500 ease-in-out
    { focus ?
      'outline-2 outline-(--primary) drop-shadow-lg/100 drop-shadow-(color:--primary)' :
      'outline' 
    }"
  ></div>
</div>