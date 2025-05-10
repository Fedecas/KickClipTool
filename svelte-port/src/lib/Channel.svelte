<script lang="ts">
  import { BadgeCheck } from 'lucide-svelte';

  import type { ChannelObject, ChannelRef } from './types';

  interface Props {
    channel: ChannelObject,
    handleClick: (channel: ChannelRef) => void
  }

  // Runes
  let { channel, handleClick }: Props = $props();

  // Internal
  const { slug, followers, name, avatar, verified } = channel;
  const validAvatar: string = avatar || randomAvatar();

  function randomAvatar(): string {
    const AVATARS: number = 6;
    const n: number = Math.floor(Math.random() * AVATARS) + 1;
    return `/default_avatars/${n}.jpeg`;
  }
</script>

<div class="group">
  <button
    type="button"
    onclick={() => handleClick({name, slug})}
    class="outline outline-(color:--secondary) p-1 flex flex-col items-center rounded-md gap-1
           transition duration-150 ease-in-out group-hover:scale-101 group-hover:outline-2
           group-hover:outline-(--primary) group-hover:shadow-lg shadow-(color:--primary)">
    <img
      src={validAvatar}
      alt="{name} avatar"
      class="w-96 h-64 object-cover rounded-md"/>
    <span class="flex flex-row">
      <h1 class="text-2xl mt-1">{name}</h1>
      {#if verified}
      <BadgeCheck class="text-(--primary) ml-2 mt-2"/>
      {/if}
    </span>
    <h2 class="font-medium text-(--primary) mb-1">{followers} followers</h2>
  </button>
</div>