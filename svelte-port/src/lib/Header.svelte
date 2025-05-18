<script lang="ts">
  import { blur } from "svelte/transition";

  interface Props {
    hasResults: boolean;
  }

  // Runes
  let { hasResults }: Props = $props();
</script>

<div
  in:blur={{ duration: 1000 }}
  class="flex flex-col items-center">
  <img
    class="w-64 drop-shadow-lg/100 transition-margin duration-500 {hasResults ? 'mt-12' : 'mt-32'}"
    src="/kick-logo.svg"
    alt="Kick logo"
  />
  <h1 class="text-3xl font-medium {hasResults ? 'invisible' : 'mb-2'}">
    Clip Tool
  </h1>
</div>