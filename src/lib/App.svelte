<script lang="ts">
  import type { ChannelObject, ClipObject, ChannelRef, ClipRef, SortType } from '$lib/types';
  import VideoPlayer from '$lib/video-player/VideoPlayer.svelte';
  import { searchClips } from '$lib/api';
  import ContentCmp from '$lib/content/Content.svelte';
  import SearchBarCmp from '$lib/SearchBar.svelte';
  import Message from '$lib/Message.svelte';
  import Header from '$lib/Header.svelte';
  import { notif } from './notifications';
  
  import { SearchBarState, setSearchBarState } from './SearchBar-state.svelte';
  import { ContentState, setContentState } from './Content-state.svelte';

  // Runes
  let downloads = $state([]);
  let clipRef: ClipRef | null = $state(null);
  let channelRef: ChannelRef | null = $state(null);
  let results: ClipObject[] | ChannelObject[] = $state([]);
  let hasResults = $derived(results.length > 0);
  let sort: SortType = $state('date');
  let lastSort: SortType = 'date';
  let endReached = $derived(
    // @ts-ignore
    channelRef !== null && channelRef.nextCursor === '' && sort === lastSort
  );

  const CMT = new ContentState();
  setContentState(CMT);
  const SB = new SearchBarState(CMT);
  setSearchBarState(SB);

  $effect(() => {
    if (sort !== lastSort && !!channelRef) {
      (async () => {
        await handleSearchClips(channelRef, sort);
      })();
    }
    lastSort = sort;
  });

  async function handleSearchClips(channel: ChannelRef, sort: SortType): Promise<void> {
    if (endReached) {
      notif.success('No more clips');
      return;
    }
    SB.searching = true;

    if (channelRef !== channel) {
      channelRef = channel;
      results = [];
    } else if (sort != lastSort) {
      channelRef.nextCursor = '';
      results = [];
    }

    const slug = channelRef.slug;
    const cursor = channelRef.nextCursor || '';
    const res = await searchClips(slug, cursor, sort);
    const clips = results as ClipObject[];
    results = [
      ...clips,
      ...res.clips.filter(c1 => !clips.some(c2 => c1.id === c2.id))
    ];
    channelRef.nextCursor = res.nextCursor;

    SB.searching = false;
  }
</script>

<main class="flex flex-col items-center overflow-hidden
  min-w-[100px] w-dvw min-h-[600px] h-dvh bg-contain bg-gray-950
  bg-[linear-gradient(to_bottom,transparent,var(--color-gray-900)),url('/space.webp')]"
>
  <div class="w-full flex flex-col items-center">
    <Header hasResults={CMT.hasResults} />
    <SearchBarCmp />
  </div>
  <ContentCmp />
  {#if clipRef}
  <VideoPlayer bind:ref={clipRef} bind:downloads />
  {/if}
  {#if SB.firstSearch && !CMT.hasResults && !SB.searching}
  <Message text="no results found :(" />
  {/if}
</main>
