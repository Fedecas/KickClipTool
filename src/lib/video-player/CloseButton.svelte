<script lang="ts">
  import { X } from 'lucide-svelte';

  interface Props {
    handleClick: () => void;
  }

  const { handleClick }: Props = $props();
</script>

<div class="group">
  <button
    type="button"
    title="Close video"
    aria-label="Close video"
    onclick={handleClick}
    class="bg-red-500 rounded-sm p-2
      transition duration-300 ease-in-out
      group-hover:bg-black group-hover:outline group-hover:scale-120"
  >
    <X class="size-8 text-black group-hover:text-white" />
  </button>
</div>