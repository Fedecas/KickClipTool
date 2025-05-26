<script lang="ts">
  import { blur } from "svelte/transition";

  import Spinner from "$lib/Spinner.svelte";

  interface Props {
    hasResults: boolean;
  }

  // Runes
  let { hasResults }: Props = $props();
  let loadedImg = $state(false);
</script>

<div
  in:blur={{ duration: 1000 }}
  class="flex flex-col items-center justify-end
          {hasResults ? 'mt-[8dvh]' : 'mt-[12dvh]'}
          transition-margin duration-500 ease-in-out">
  <div class="relative w-2xs flex justify-center items-center">
    <img
      src="/kick-logo.svg"
      alt="Kick logo"
      onload={() => { loadedImg = true }}
      class="size-full transition-opacity duration-1000 ease-in px-5
              {loadedImg ? 'opacity-100' : 'opacity-0'}"/>
    {#if !loadedImg}
    <div class="absolute w-[20%] flex items-center">
      <Spinner />
    </div>
    {/if}
  </div>
  <h1 class="text-3xl font-medium {hasResults ? 'invisible' : 'my-2'}">
    Clip Tool
  </h1>
</div>