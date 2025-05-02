<script lang="ts">
  let { value = $bindable(), searching, handle_search, hasResults } = $props()
</script>

<div class="relative">
  <input
    class="pepe outline-2 rounded-3xl w-96 transition-all text-lg py-3 pl-16 bg-black focus:outline-green-500 focus:outline-3 {hasResults ? 'my-6' : 'my-16'}"
    placeholder="Search channel"
    type="search"
    bind:value={value}
    oninput={handle_search}
  />
  <span class="absolute inset-y-0 left-4 flex items-center">
    {#if searching}
    <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-500"></div>
    {:else}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
    {/if}
  </span>
</div>

<style>
  .pepe:focus {
    filter: drop-shadow(0 0 2rem #00ff00);
  }
</style>