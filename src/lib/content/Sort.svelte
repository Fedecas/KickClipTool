<script lang="ts">
  import { Eye, Calendar, ArrowDownWideNarrow } from 'lucide-svelte';

  import type { SortType } from '$lib/types';

  import SortButton from './SortButton.svelte';

  interface Props {
    selectSort: (type: SortType) => Promise<void>;
  }

  const { selectSort }: Props = $props();
  let sort: SortType = $state('date');

  const handleClick = async (type: SortType): Promise<void> => {
    sort = type;
    await selectSort(type);
  }
</script>

<div class="ml-5 flex flex-row items-center gap-3 z-10">
  <SortButton type={'date'} {sort} Icon={Calendar} {handleClick} />
  <SortButton type={'view'} {sort} Icon={Eye} {handleClick} />
  <div class="p-2">
    <ArrowDownWideNarrow class="size-7 opacity-90" />
  </div>
</div>