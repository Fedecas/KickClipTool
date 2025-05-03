<script lang="ts">
  import Channel from './Channel.svelte';

  let { channels, hasResults } = $props();
</script>

<div class="outline w-full h-full m-3 overflow-y-auto {hasResults ? '' : 'invisible'}">
  <div class="h-full m-3 p-2 grid grid-cols-6 gap-2">
    {#each channels as channel}
    <Channel {channel}/>
    {/each}
  </div>
</div>