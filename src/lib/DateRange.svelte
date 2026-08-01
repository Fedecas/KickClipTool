<script lang="ts">
  import { untrack } from 'svelte';

  import { browser } from '$app/environment';
  import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface Props {
    onRangeChange?: (from: Date | undefined, to: Date | undefined) => void;
    startYear?: number;
    locale?: string;
    startDate?: Date;
    endDate?: Date;
  }

  const {
    onRangeChange,
    startYear = 2020,
    locale = browser ? navigator.language : 'en-US',
    startDate: initialStartDate,
    endDate: initialEndDate,
  }: Props = $props();

  let currentMonth = $derived(initialStartDate ? new Date(initialStartDate.getFullYear(), initialStartDate.getMonth()) : new Date());
  let startDate = $state<Date | undefined>(untrack(() => initialStartDate));
  let endDate = $state<Date | undefined>(untrack(() => initialEndDate));
  let showYearPicker = $state(false);
  let showMonthsPicker = $state(false);

  const monthNames = $derived(getMonthNames(locale));
  const dayNames = $derived(
    getDaysInMonth(new Date(startYear, 0))
      .slice(0, 7)
      .map((date) => {
        if (date) {
          return date.toLocaleDateString(locale, { weekday: 'short' }).charAt(0);
        }
        return '';
      })
  );

  const currentYear = new Date().getFullYear();
  const years = $derived(
    Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).filter((year) => year <= currentYear)
  );

  function getMonthNames(locale: string) {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const months = [];
    for (let month = 0; month < 12; month++) {
      const sampleDate = new Date(startYear, month, 1);
      months.push(formatter.format(sampleDate));
    }
    return months;
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return;

    if (!startDate || (startDate && endDate)) {
      startDate = date;
      endDate = undefined;
    } else if (date < startDate) {
      endDate = startDate;
      startDate = date;
    } else {
      endDate = date;
    }

    if (onRangeChange) {
      onRangeChange(startDate, endDate);
      showYearPicker = false;
      showMonthsPicker = false;
    }
  };

  const selectYear = (year: number) => {
    currentMonth = new Date(year, currentMonth.getMonth());
    showYearPicker = false;
    showMonthsPicker = true;
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate) return date.getTime() === startDate.getTime();
    return date.getTime() === today.getTime();
  };

  const isFuture = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() > today.getTime();
  };

  const isInRange = (date: Date | null): boolean => {
    if (!date || !startDate) return false;
    if (!endDate) return date.getTime() === startDate.getTime();
    const time = date.getTime();
    return time >= startDate.getTime() && time <= endDate.getTime();
  };

  const previousMonth = () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  };

  const nextMonth = () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  };
</script>

<div class="w-[340px] bg-[var(--date-bg)] rounded-lg shadow-2xl overflow-hidden border border-[var(--date-border)]">
  <div class="bg-[var(--date-header-bg)] px-4 py-3 border-b border-[var(--date-border)]">
    <div class="flex items-center justify-between text-sm">
      <span class="text-[var(--date-text)]">
        {startDate ? startDate.toLocaleDateString(locale, { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'Start Date'}
      </span>
      <span class="text-[var(--date-text-muted)]">-</span>
      <span class="text-[var(--date-text)]">
        {endDate ? endDate.toLocaleDateString(locale, { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'End Date'}
      </span>
      <CalendarDays class="w-4 h-4 text-[var(--date-text)]" />
    </div>
  </div>
  <div class="p-3 select-none">
    <div class="flex items-center justify-between bg-[var(--date-header-bg)] rounded-lg mb-3 p-2">
      <button onclick={() => previousMonth()} class="p-1 hover:bg-[var(--date-hover)] rounded transition-colors cursor-pointer">
        <ChevronLeft class="w-5 h-5 text-white" />
      </button>
      <button
        onclick={() => (showYearPicker = !showYearPicker)}
        class="text-white cursor-pointer bg-[var(--date-hover)] font-semibold hover:bg-[var(--date-disabled)] px-3 py-1 rounded transition-colors"
      >
        {monthNames[currentMonth.getMonth()]}
        {currentMonth.getFullYear()}
      </button>
      <button
        onclick={() => {
          if (isFuture(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))) return;
          nextMonth();
        }}
        class="p-1 select-none hover:bg-[var(--date-hover)] rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
        disabled={isFuture(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
      >
        <ChevronRight class="w-5 h-5 text-white disabled:text-gray-700" />
      </button>
    </div>
    {#if showYearPicker}
      <div class="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto">
        {#each years as year}
          <button
            onclick={() => selectYear(year)}
            class="p-2 rounded-lg text-sm transition-all bg-[var(--date-header-bg)] cursor-pointer
              {year === currentMonth.getFullYear()
              ? 'bg-[var(--primary)] font-bold text-[var(--date-selected-text)]'
              : 'text-[var(--date-text-light)] hover:bg-[var(--date-hover)]'}"
          >
            {year}
          </button>
        {/each}
      </div>
    {:else if showMonthsPicker}
      <div class="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto">
        {#each monthNames as month, index}
          {@const Feture = isFuture(new Date(currentMonth.getFullYear(), index))}
          <button
            onclick={() => {
              if (Feture) return;
              currentMonth = new Date(currentMonth.getFullYear(), index);
              showMonthsPicker = false;
            }}
            disabled={Feture}
            class="p-2 rounded-lg text-sm transition-all cursor-pointer bg-[var(--date-header-bg)] disabled:bg-none disabled:text-[var(--date-disabled)] disabled:cursor-not-allowed
              {index === currentMonth.getMonth()
              ? 'bg-[var(--primary)] font-bold text-[var(--date-selected-text)]'
              : 'text-[var(--date-text-light)] hover:bg-[var(--date-hover)]'}"
          >
            {month}
          </button>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-7 gap-1 mb-2">
        {#each dayNames as day}
          <div class="text-center text-xs text-[var(--date-text)] uppercase font-medium">
            {day}
          </div>
        {/each}
      </div>
      <div class="grid grid-cols-7 gap-1 select-none">
        {#each getDaysInMonth(currentMonth) as date}
          {#if date}
            {@const Future = isFuture(date)}
            {@const Today = isToday(date)}
            {@const Selected = isInRange(date)}
            <button
              onclick={() => handleDateClick(date)}
              disabled={Future}
              class="w-9 h-9 text-sm rounded-lg transition-all disabled:text-[var(--date-disabled)] disabled:cursor-not-allowed
              {Selected
                ? 'bg-[var(--primary)] font-bold text-[var(--date-selected-text)] hover:bg-[var(--hover-primary)]'
                : Today
                  ? 'bg-[var(--primary)] font-bold text-[var(--date-selected-text)]   hover:bg-[var(--hover-primary)] focus:ring-0'
                  : 'text-[var(--date-text-light)] hover:bg-[var(--date-hover)]'}"
            >
              {date.getDate()}
            </button>
          {:else}
            <div class="w-9 h-9"></div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
</style>
