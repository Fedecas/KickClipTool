<script lang="ts">
  import { Download } from 'lucide-svelte';

  interface Props {
    id: string;
    url: string;
  }

  let { id, url }: Props = $props();

  async function handleDownload(): Promise<void> {
    let response: Response;
    let blob: Blob | null = null;
    try {
      response = await fetch('/api/download', {
        method: 'POST',
        body: JSON.stringify({ url: url }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        blob = await response.blob();
      } else {
        throw new Error(`Network response was not ok (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
</script>

<div class="group">
  <button
    type="button"
    aria-label="Download video"
    onclick={handleDownload}
    class="bg-(--primary) rounded-sm p-2
           transition duration-300 ease-in-out
           group-hover:bg-black group-hover:outline group-hover:scale-120">
    <Download class="size-8 text-black group-hover:text-white" />
  </button>
</div>