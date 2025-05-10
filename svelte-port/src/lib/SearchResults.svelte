<script lang="ts">
  import type { ChannelObject, ChannelRef, ClipObject, ClipRef } from '$lib/types';
  import Channel from '$lib/Channel.svelte';
  import Clip from '$lib/Clip.svelte';

  interface Props {
    results: ClipObject[] | ChannelObject[],
    hasResults: boolean,
    selected: string,
    getClips: (channel: ChannelRef) => void,
    clipRef: ClipRef | null
  }

  // Constants
  const COOLDOWN: number = 1000;
  const THRESHOLD: number = 300;

  // Runes
  let {
    results = [],
    hasResults = false,
    selected = '',
    getClips = () => {},
    clipRef = $bindable(null)
  }: Props = $props();

  // Internal
  let actual: ChannelRef | null = null;
  let lastScrolledTo: number = 0;
  let triggered: boolean = false;

  function handleChannelClick(channel: ChannelRef): void {
    actual = channel;
    getClips(actual);
  }

  function handleClipClick(ref: ClipRef): void {
    clipRef = ref;
  }

  function handleScroll(e: any): void {
    console.log(e, typeof(e))
    if (selected) {
      const target: Element = e.currentTarget;
      const scrolledTo: number = target.scrollTop + target.clientHeight;
      const isGoingDown: boolean = scrolledTo > lastScrolledTo;
      const shouldTrigger: boolean = scrolledTo >= (target.scrollHeight - THRESHOLD);
      if (isGoingDown && shouldTrigger && !triggered) {
        triggered = true;
        if (actual) getClips(actual);
        setTimeout(() => {triggered = false}, COOLDOWN);
      }
      lastScrolledTo = scrolledTo;
    }
  }
</script>

<div
  class="outline size-full m-3 overflow-y-auto {hasResults ? '' : 'invisible'}"
  onscroll={(e) => handleScroll(e)}>
  <div class="h-full m-3 p-2 grid grid-cols-6 gap-2">
    {#if !selected}
      {#each results as channel}
        <Channel channel={(channel as ChannelObject)} handleClick={handleChannelClick} />
      {/each}
    {:else}
      {#each results as clip}
        <Clip clip={(clip as ClipObject)} handleClick={handleClipClick} />
      {/each}
    {/if}
  </div>
</div>