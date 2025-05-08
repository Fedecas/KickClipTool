<script lang="ts">
  import Channel from './Channel.svelte';
  import Clip from './Clip.svelte';

  let { results, hasResults, selected, getClips, clipRef = $bindable(null) } = $props();

  const COOLDOWN: number = 1000;
  const THRESHOLD: number = 300;

  let actual: any = {};
  let lastScrolledTo: number = 0;
  let triggered: boolean = false;

  function handleChannelClick(channel: any): void {
    actual = channel;
    getClips(actual);
  }

  function handleScroll(e: any): void {
    if (selected) {
      const target: Element = e.currentTarget;
      const scrolledTo: number = target.scrollTop + target.clientHeight;
      const isGoingDown: boolean = scrolledTo > lastScrolledTo;
      const shouldTrigger: boolean = scrolledTo >= (target.scrollHeight - THRESHOLD);
      if (isGoingDown && shouldTrigger && !triggered) {
        getClips(actual);
        triggered = true;
        setTimeout(() => {triggered = false}, COOLDOWN);
      }
      lastScrolledTo = scrolledTo;
    }
  }

  function handleClipClick(clip: any): void {
    const parts: string[] = clip.url.split('/');
    clipRef = {
      id: parts[parts.length - 3],
      name: parts[parts.length - 2]
    };
  }
</script>

<div
  class="outline w-full h-full m-3 overflow-y-auto {hasResults ? '' : 'invisible'}"
  onscroll={(e) => handleScroll(e)}>
  <div class="h-full m-3 p-2 grid grid-cols-6 gap-2">
    {#if !selected}
      {#each results as channel}
        <Channel {channel} handleClick={handleChannelClick} />
      {/each}
    {:else}
      {#each results as clip}
        <Clip {clip} handleClick={handleClipClick} />
      {/each}
    {/if}
  </div>
</div>