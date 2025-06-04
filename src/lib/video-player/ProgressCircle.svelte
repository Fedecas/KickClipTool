<script lang="ts">
  let { progress } = $props();
  const total = 251.2;
  let offset = $derived(total * (1 - progress));
</script>

<div class="w-full aspect-square">
  <svg class="size-full" viewBox="0 0 100 100">
    <!-- Background circle -->
    <circle
      r="40"
      cx="50"
      cy="50"
      fill="transparent"
      stroke-width="14"
      class="stroke-(--secondary)"
    ></circle>
    <!-- Progress circle -->
    <circle
      r="40"
      cx="50"
      cy="50"
      fill="transparent"
      stroke-width="14"
      stroke-linecap="round"
      stroke-dasharray={total}
      stroke-dashoffset={offset}
      class="stroke-(--primary) transition-[stroke-dashoffset] -rotate-90 origin-center"
    ></circle>
  </svg>
</div>
