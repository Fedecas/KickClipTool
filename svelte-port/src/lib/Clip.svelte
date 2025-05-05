<script lang="ts">
  import { Eye } from 'lucide-svelte';

  let { clip } = $props();

  const creator: string = clip.creator?.username || '';
  const date: string = clip.created_at || '';
  const duration: number = clip.duration || 0;
  const thumbnail: string = clip.thumbnail_url || '';
  const title: string = clip.title || '';
  const url: string = clip.clip_url || '';
  const views: number = clip.views || 0;

  function formatDuration(duration: number): string {
    const minutes: string = `${Math.floor(duration / 60)}`;
    const seconds: string = `${duration % 60}`;
    return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  };
</script>

<button
  type="button"
  class="outline rounded-sm p-1 hover:outline-(--primary)">
  <span class="relative flex">
    <img
    src={thumbnail}
    alt="Clip thumbnail"
    class="w-full rounded-sm object-cover"/>
    <h1 class="absolute bg-black/70 rounded-sm text-sm left-1 top-1 p-1.5">{formatDuration(duration)}</h1>
    <span class="absolute bg-black/60 rounded-sm right-1 bottom-1 p-1.5 flex flex-row">
      <h1 class="text-sm font-bold">{views}</h1>
      <Eye class="ml-1 h-5.5" />
    </span>
  </span>
  <h1 class="content-center text-xl/4 font-medium leading-none line-clamp-2 h-12">{title}</h1>
  <h1 class="text-(--primary) font-medium">{creator}</h1>
  <h1 class="">{date}</h1>
</button>