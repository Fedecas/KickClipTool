<script lang="ts">
  let { product } = $props();
</script>

<div class="outline h-64">
  <h1 class="text-3xl font-medium">{product.slug}</h1>
  <h2 class="text-xl font-bold"> ({product.slug}€)</h2>
</div>