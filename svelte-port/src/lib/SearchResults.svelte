<script lang="ts">
  import Channel from './Channel.svelte';

  let { results, hasResults = $bindable(), selected, onClick } = $props();
</script>

<div class="outline w-full h-full m-3 overflow-y-auto {hasResults ? '' : 'invisible'}">
  <div class="h-full m-3 p-2 grid grid-cols-6 gap-2">
    {#if !selected}
      {#each results as channel}
      <Channel {channel} handleClick={onClick}/>
      {/each}
    {:else}
      <h1>OAA</h1>
    {/if}
  </div>
</div>