<script lang="ts">
  //import VideoPlayer from '$lib/video-player/VideoPlayer.svelte';
  //import Message from '$lib/Message.svelte';
  import Content from '$lib/content/Content.svelte';
  import Header from '$lib/Header.svelte';
  import SearchBar from '$lib/SearchBar.svelte';

  import { ChannelState, setChannelState } from './ChannelState.svelte';
  import { ClipState, setClipState } from './ClipState.svelte';
  import { ContentState, setContentState } from './ContentState.svelte';
  import { SearchBarState, setSearchBarState } from './SearchBarState.svelte';

  const CHS = new ChannelState();
  const CLS = new ClipState();
  const CS = new ContentState(CHS, CLS);
  const SBS = new SearchBarState(CS);

  setChannelState(CHS);
  setClipState(CLS);
  setContentState(CS);
  setSearchBarState(SBS);
</script>

<main class="flex flex-col items-center overflow-hidden
  min-w-[100px] w-dvw min-h-[600px] h-dvh bg-contain bg-gray-950
  bg-[linear-gradient(to_bottom,transparent,var(--color-gray-900)),url('/space.webp')]"
>
  <div class="w-full flex flex-col items-center">
    <Header hasResults={CS.hasResults} />
    <SearchBar />
  </div>
  <Content />
  <!--
  {#if clipRef}
  <VideoPlayer bind:ref={clipRef} bind:downloads />
  {/if}
  -->
</main>
