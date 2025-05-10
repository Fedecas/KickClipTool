<script lang="ts">
  import { formatDistance } from 'date-fns';
  import { Eye, Calendar } from 'lucide-svelte';

  import type { ClipObject, ClipRef } from '$lib/types';

  interface Props {
    clip: ClipObject,
    handleClick: (ref: ClipRef) => void
  }

  // Runes
  let { clip, handleClick }: Props = $props();

  // Internal
  const { id, title, video, thumbnail, views, duration, date, creator, channel } = clip;

  function formatDuration(duration: number): string {
    const minutes: string = `${Math.floor(duration / 60)}`;
    const seconds: string = `${duration % 60}`;
    return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  };

  function formatDate(date: Date): string {
    const today: Date = new Date();
    return formatDistance(today, date);
  }
</script>

<button
  type="button"
  onclick={() => {handleClick({id, thumbnail, video, title, channel})}}
  class="outline rounded-sm p-1 hover:outline-(--primary)">
  <span class="relative flex">
    <img
    src={thumbnail}
    alt="Clip thumbnail"
    class="w-full rounded-sm object-cover" />
    <h3 class="absolute bg-black/70 rounded-sm text-sm left-1 top-1 p-1.5">{formatDuration(duration)}</h3>
    <span class="absolute bg-black/60 rounded-sm right-1 bottom-1 p-1.5 flex flex-row">
      <h3 class="text-sm font-bold">{views}</h3>
      <Eye class="ml-1 h-5.5" />
    </span>
  </span>
  <h1 class="content-center text-xl/4 font-medium leading-none line-clamp-2 h-12">{title}</h1>
  <h2 class="text-(--primary) font-medium">{creator}</h2>
  <span class="items-center justify-center flex flex-row">
    <Calendar class="text-(--secondary) mr-1 h-4.5" />
    <h3 class="text-(--secondary)">{formatDate(date)}</h3>
  </span>
</button>