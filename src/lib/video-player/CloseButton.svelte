<script lang="ts">
  import { X } from 'lucide-svelte';

  import type { ClipRef } from '$lib/types';

  interface Props {
    ref: ClipRef | null;
  }

  let { ref = $bindable() }: Props = $props();
</script>

<div class="group">
  <button
      type="button"
      aria-label="Close video"
      onclick={() => { ref = null }}
      class="bg-red-500 rounded-sm p-2
             transition duration-300 ease-in-out
             group-hover:bg-black group-hover:outline group-hover:scale-120">
      <X class="size-8 text-black group-hover:text-white" />
  </button>
</div>