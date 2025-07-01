<script lang="ts">
  import Content from '$lib/content/Content.svelte';
  import Header from '$lib/Header.svelte';
  import SearchBar from '$lib/SearchBar.svelte';

  import { ChannelState, setChannelState } from './ChannelState.svelte';
  import { ClipState, setClipState } from './ClipState.svelte';
  import { ContentState, setContentState } from './content/ContentState.svelte';
  import { VideoState, setVideoState } from './VideoState.svelte';

  const channelState = new ChannelState();
  const clipState = new ClipState();
  const contentState = new ContentState(channelState, clipState);
  const videoState = new VideoState(contentState);

  setChannelState(channelState);
  setClipState(clipState);
  setContentState(contentState);
  setVideoState(videoState);
</script>

<main class="flex flex-col items-center overflow-hidden
  min-w-[100px] w-dvw min-h-[600px] h-dvh bg-contain bg-gray-950
  bg-[linear-gradient(to_bottom,transparent,var(--color-gray-900)),url('/space.webp')]"
>
  <div class="w-full flex flex-col items-center">
    <Header />
    <SearchBar />
  </div>
  <Content />
</main>
