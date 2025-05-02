<script>
  let { products, hasResults } = $props();
</script>

<div class="outline w-full h-full m-3 overflow-y-auto {hasResults ? '' : 'invisible'}">
  <div class="h-full m-3 p-2 grid grid-cols-6 gap-2">
    {#each products as product}
      <div class="outline h-64">
        <h1 class="text-3xl font-medium">{product.title}</h1>
        <h2 class="text-xl font-bold"> ({product.price}€)</h2>
      </div>
    {/each}
  </div>
</div>