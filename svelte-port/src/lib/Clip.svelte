<script lang="ts">
  let { clip } = $props();

  const creator: string = clip.creator?.username || '';
  const date: string = clip.created_at || '';
  const duration: number = clip.duration || 0;
  const thumbnail: string = clip.thumbnail_url || '';
  const title: string = clip.title || '';
  const url: string = clip.clip_url || '';
  const views: number = clip.views || 0;
</script>

<button
  type="button"
  class="outline rounded-md gap-1">
  <img
    src={thumbnail}
    alt="Clip thumbnail"
    class="w-full object-cover hover:outline"/>
  <h1 class="content-center text-xl/4 font-medium leading-none line-clamp-2 min-h-12">{title}</h1>
  <h1 class="text-(--primary) font-medium">{creator}</h1>
  <h1 class="">{date}</h1>
</button>