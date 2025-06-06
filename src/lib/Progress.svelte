<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    progress: number, // 0..1
  }

  let { progress }: Props = $props();
  let radio = $state(0);
  let total = $derived(2 * Math.PI * radio);
  let offset = $derived(total * (1 - progress));
  let container: HTMLDivElement;

  onMount(() => {
    const { width } = container.getBoundingClientRect();
    radio = width * 0.6;
  });
</script>

<div
  bind:this={container}
  class="w-full aspect-square"
>
  <svg
    viewBox="0 0 50 50"
    class="size-full"
  >
    <circle
      r={radio}
      cx="50%"
      cy="50%"
      fill="transparent"
      stroke-width="3"
      class="stroke-(--secondary)"
    ></circle>
    <circle
      r={radio}
      cx="50%"
      cy="50%"
      fill="transparent"
      stroke-width="6"
      stroke-linecap="round"
      stroke-dasharray={total}
      stroke-dashoffset={(offset < 0) ? 0 : (offset > total) ? total : offset}
      class="stroke-(--primary) -rotate-90 origin-center"
    ></circle>
  </svg>
</div>