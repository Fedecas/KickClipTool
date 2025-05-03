<script lang="ts">
  import Channel from './Channel.svelte';

  let { products, hasResults } = $props();
</script>

<div class="outline w-full h-full m-3 overflow-y-auto {hasResults ? '' : 'invisible'}">
  <div class="h-full m-3 p-2 grid grid-cols-6 gap-2">
    {#each products as product}
    <Channel {product}/>
    {/each}
  </div>
</div>