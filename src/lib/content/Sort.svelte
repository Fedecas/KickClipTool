<script lang="ts">
  import { Eye, Calendar, ArrowDownWideNarrow } from 'lucide-svelte';

  import type { SortType } from '$lib/types';
  import SortButton from './SortButton.svelte';

  interface Props {
    sort: SortType
  }

  let { sort = $bindable() }: Props = $props();

  function handleClick(type: SortType): void {
    sort = type;
  }
</script>

<div class="ml-5 flex flex-row items-center gap-3 z-10">
  <SortButton type={'date'} {sort} Icon={Calendar} {handleClick} />
  <SortButton type={'views'} {sort} Icon={Eye} {handleClick} />
  <div
    aria-hidden="true"
    class="p-2"
  >
    <ArrowDownWideNarrow class="size-7 opacity-90" />
  </div>
</div>