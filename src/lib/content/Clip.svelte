<script lang="ts">
  import { Eye, Calendar, Play } from 'lucide-svelte';

  import { blur } from 'svelte/transition';

  import type { ClipObject, ClipRef } from '$lib/types';
  import { formatDateDistance, formatDuration } from '$lib/utils';
  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    clip: ClipObject,
    handleClick: (ref: ClipRef) => void
  }

  // Runes
  let { clip, handleClick }: Props = $props();
  let loadedImg = $state(false);

  // Internal
  const { id, title, video, thumbnail, views, duration, date, creator, channel } = clip;

  function onClick(): void {
    const ref: ClipRef = { id, thumbnail, video, title, channel };
    handleClick(ref);
  }
</script>

<button
  in:blur={{ duration: 700 }}
  type="button"
  onclick={onClick}
  class="relative flex flex-col group rounded-sm aspect-square p-1 bg-[#242428]
          inset-shadow-sm/100 shadow-sm/100 items-center justify-start
          hover:bg-gray-800 hover:inset-shadow-none hover:shadow-none">
  <div class="relative flex bg-black/40 w-full">
    <img
      src={thumbnail}
      alt="Clip thumbnail"
      loading="lazy"
      onload={() => { loadedImg = true }}
      class="w-full aspect-video rounded-sm object-contain
              {loadedImg ? 'opacity-100' : 'opacity-0'}
              transition-opacity duration-1000 ease-in
              group-hover:brightness-50 group-hover:shadow-md/100"/>
    <h3 class="absolute bg-black/70 rounded-sm text-sm left-1 top-1 p-1.5">{formatDuration(duration)}</h3>
    <div class="absolute bg-black/60 rounded-sm right-1 bottom-1 p-1.5 flex flex-row items-center">
      <h3 class="text-sm font-bold">{views}</h3>
      <Eye class="ml-1 h-5.5" />
    </div>
    {#if loadedImg}
    <div class="absolute w-[20%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0
                group-hover:opacity-80 trasition-opacity duration-500 ease-in-out">
      <Play class="text-transparent size-full fill-white/100 aspect-square drop-shadow-md/100" />
    </div>
    {:else}
    <div class="absolute w-[20%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </div>
    {/if}
  </div>
  <h1 class="w-full content-center mt-2 font-medium text-xl
            overflow-hidden leading-6 line-clamp-2">{title}</h1>
  <div class="flex flex-col mt-auto">
    <h2 class="text-(--primary) font-medium">{creator}</h2>
    <div class="items-center flex flex-row">
      <Calendar class="text-(--secondary) mr-1 h-4.5" />
      <h3
        title={date.toString()}
        class="text-(--secondary)">
        {formatDateDistance(date)}
      </h3>
    </div>
  </div>
</button>