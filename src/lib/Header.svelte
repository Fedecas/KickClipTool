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
  class="flex flex-col items-center justify-end gap-2
    transition-[margin, opacity] delay-100 duration-600 ease-in-out
    {hasResults ? 'opacity-0 -mt-28' : 'opacity-90 mt-28'}"
>
  <div class="relative w-2xs flex justify-center items-center">
    <img
      src="/kick-logo.svg"
      alt="Kick logo"
      onload={() => { loadedImg = true }}
      class="size-full transition-opacity duration-1000 ease-in px-5
              {loadedImg ? 'opacity-100' : 'opacity-0'}"
    />
    {#if !loadedImg}
    <div class="absolute w-[20%] flex items-center">
      <Spinner />
    </div>
    {/if}
  </div>
  <h1 class="text-3xl font-medium">
    Clip Tool
  </h1>
</div>