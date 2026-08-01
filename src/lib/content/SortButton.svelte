<script lang="ts">
  import { untrack } from 'svelte';

  import type { SortType } from '$lib/types';
  import DateRange from '$lib/DateRange.svelte';

  interface Props {
    type: SortType;
    sort: SortType;
    Icon: any;
    locale?: string;
    startDate?: Date;
    endDate?: Date;
    handleClick: (type: SortType) => void;
    onDateRangeChange?: (from: Date | undefined, to: Date | undefined) => void;
  }

  const { type, sort, Icon, handleClick, onDateRangeChange, locale, startDate, endDate }: Props = $props();
  const pressed = $derived(sort === type);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let selectedStart = $state<Date>(untrack(() => startDate ?? today));
  let selectedEnd = $state<Date>(untrack(() => endDate ?? today));
  let showDatePicker = $state(false);

  const handleDateChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    onDateRangeChange?.(startDate, endDate);
    selectedStart = startDate ?? today;
    selectedEnd = endDate ?? today;
    if (startDate && endDate) showDatePicker = false;
  };
</script>

<div class="relative">
  <button
    type="button"
    title="Sort by {type}"
    onclick={() => {
      handleClick(type);
      if (type === 'date') showDatePicker = !showDatePicker;
    }}
    aria-label="Sort by {type}"
    aria-pressed={pressed}
    class="p-2 cursor-pointer hover:bg-gray-700 transition-colors flex items-center gap-2
      {pressed ? 'rounded-t-sm border-t border-x -mb-[1px] bg-gray-800' : 'border rounded-sm bg-gray-950'}"
  >
    <Icon class="size-7 opacity-90 {pressed ? 'text-green-400' : 'text-gray-400'}" />
    {#if type === 'date'}
      <span class="text-xs text-gray-300 whitespace-nowrap select-none">
        {selectedStart.toLocaleDateString(locale ?? 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} → {selectedEnd
          .toLocaleDateString(locale ?? 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })
          .toUpperCase()}
      </span>
    {/if}
  </button>

  {#if type === 'date' && pressed && showDatePicker}
    <div class="absolute top-full left-0 mt-1 z-50">
      <DateRange onRangeChange={handleDateChange} {locale} startDate={selectedStart} endDate={selectedEnd} />
    </div>
  {/if}
</div>
