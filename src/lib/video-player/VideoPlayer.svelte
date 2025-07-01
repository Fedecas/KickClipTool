<script lang="ts">
  import { fly } from 'svelte/transition';

  import DownloadButton from './DownloadButton.svelte';
  import VideoElement from './VideoElement.svelte';
  import CloseButton from './CloseButton.svelte';
  import WebButton from './WebButton.svelte';
  import { notif } from '$lib/notifications';
  import { getVideoState } from '$lib/VideoState.svelte';

  const self = getVideoState();
  const id = self.id;
  const url = self.url;
  const ext = self.ext;
  const title = self.title;
  const thumbnail = self.thumbnail;
  const channel = self.channel;
  const canDownload = self.canDownload;
  const webUrl = `https://kick.com/${channel}/clips/${id}`;

  let isDownloading = $derived(self.isDownloading);

  async function handleDownload(): Promise<void> {
    if (!canDownload) return console.warn('Clip download is disabled in the web version');
    notif.success('Downloading...');
    await self.download();
    notif.success('Download complete!');
  }

  function handleClose(): void {
    self.close();
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
  <VideoElement {thumbnail} {url} {isDownloading} {canDownload} {ext} />
  <div class="absolute flex flex-col justify-center items-center
    gap-4 w-24 p-5 bg-black/70 right-8 rounded-sm"
  >
    <CloseButton handleClick={handleClose} />
    <DownloadButton {id} {isDownloading} {canDownload} handleClick={handleDownload} />
    <WebButton url={webUrl} />
  </div>
</div>