<script lang="ts">
  import type { SortType } from '$lib/types';

  interface Props {
    type: SortType;
    sort: SortType;
    Icon: any;
    handleClick: (type: SortType) => void;
  }

  const { type, sort, Icon, handleClick }: Props = $props();
  const pressed = $derived(sort === type);
</script>

<button
  type="button"
  title="Sort by {type}"
  onclick={() => handleClick(type)}
  aria-label="Sort by {type}"
  aria-pressed={pressed}
  class="p-2 hover:bg-gray-800
    { pressed ?
      "rounded-t-sm border-t border-x -mb-[1px] bg-gray-800" :
      "border rounded-sm bg-gray-950"
    }"
  >
  <Icon
    class="size-7 opacity-90
    { pressed ? "text-(--primary)" : "text-(--secondary)" }"
  />
</button>