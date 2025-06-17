<script lang="ts">
  import { fly } from 'svelte/transition';

  import DownloadButton from './DownloadButton.svelte';
  import VideoElement from './VideoElement.svelte';
  import CloseButton from './CloseButton.svelte';
  import WebButton from './WebButton.svelte';
  import { notif } from '$lib/notifications';
  import { downloadClip } from './download';
  import type { ClipRef } from '$lib/types';

  interface Props {
    ref: ClipRef | null,
    downloads: string[],
  }

  let { ref = $bindable(), downloads = $bindable() }: Props = $props();

  // @ts-ignore
  const isTauri = !!window.__TAURI_INTERNALS__;

  const id = ref?.id || '';
  const title = ref?.title || '';
  const videoUrl = ref?.video || '';
  const posterUrl = ref?.thumbnail || '';
  const channel = ref?.channel || '';
  const webUrl = ref ? `https://kick.com/${channel}/clips/${id}` : '';

  let downloading = $derived(downloads.includes(id));

  function handleClose(): void {
    ref = null;
  }

  async function handleDownload(): Promise<void> {
    notif.success('Downloading...');
    downloads.push(id);
    await downloadClip(isTauri, videoUrl, id);
    downloads.splice(downloads.indexOf(id), 1);
    notif.success('Download complete!');
  }
</script>

<div
  in:fly={{ y: 500, duration: 500 }}
  out:fly={{ y: -500, duration: 500 }}
  class="absolute flex flex-row fixed inset-0 items-center justify-center
         backdrop-blur-sm bg-linear-[black,transparent,black] z-40"
>
  <h1 class="absolute top-6 left-10 text-3xl font-bold max-w-[90dvw] truncate">
    {title}
  </h1>
  <VideoElement {posterUrl} {videoUrl} {downloading} />
  <div class="absolute flex flex-col justify-center items-center gap-4 w-24 p-5 bg-black/70 right-8 rounded-sm">
    <CloseButton handleClick={handleClose} />
    <DownloadButton {id} {downloading} {isTauri} handleClick={handleDownload} />
    <WebButton url={webUrl} />
  </div>
</div>