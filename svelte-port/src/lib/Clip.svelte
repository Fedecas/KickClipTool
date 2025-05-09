<script lang="ts">
  import type { ClipRef } from './types';
  import { Eye, Calendar } from 'lucide-svelte';
  import { formatDistance } from 'date-fns';

  interface Props {
    clip: any,
    handleClick: (ref: ClipRef) => void
  }

  let { clip, handleClick }: Props = $props();

  const creator: string = clip.creator.username;
  const date: string = clip.created_at;
  const duration: number = clip.duration;
  const thumbnail: string = clip.thumbnail_url;
  const title: string = clip.title;
  const views: number = clip.views;

  // For clip reference
  const id: string = clip.id;
  const video: string = clip.clip_url;
  const slug: string = clip.channel.slug;

  function formatDuration(duration: number): string {
    const minutes: string = `${Math.floor(duration / 60)}`;
    const seconds: string = `${duration % 60}`;
    return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  };

  function formatDate(date: string): string {
    const today: Date = new Date();
    const clipDate: Date = new Date(date);
    return formatDistance(today, clipDate);
  }
</script>

<button
  type="button"
  onclick={() => {
    const ref: ClipRef = {
      id: id,
      thumbnail: thumbnail,
      video: video,
      title: title,
      channel: slug
    };
    handleClick(ref);
  }}
  class="outline rounded-sm p-1 hover:outline-(--primary)">
  <span class="relative flex">
    <img
    src={thumbnail}
    alt="Clip thumbnail"
    class="w-full rounded-sm object-cover"/>
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