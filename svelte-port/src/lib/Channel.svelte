<script lang="ts">
  import { BadgeCheck } from 'lucide-svelte';

  import type { ChannelObject, ChannelRef } from './types';

  interface Props {
    channel: ChannelObject,
    handleClick: (channel: ChannelRef) => void
  }

  // Runes
  let {
    channel,
    handleClick = () => {}
  }: Props = $props();

  // Internal
  const { slug, followers, name, avatar, verified } = channel;
  const validAvatar: string = avatar || randomAvatar();

  function randomAvatar(): string {
    const AVATARS: number = 6;
    const n: number = Math.floor(Math.random() * AVATARS) + 1;
    return `/default_avatars/${n}.jpeg`;
  }
</script>

<button
  type="button"
  onclick={() => handleClick({name: name, slug: slug})}
  class="outline flex flex-col items-center rounded-md gap-1">
  <img
    src={validAvatar}
    alt="Channel avatar"
    class="w-96 h-64 object-cover hover:outline"/>
  <span class="flex flex-row">
    <h1 class="text-2xl mt-1">{name}</h1>
    {#if verified}
    <BadgeCheck class="text-(--primary) ml-2 mt-2"/>
    {/if}
  </span>
  <h2 class="font-medium text-(--primary) mb-1">{followers} followers</h2>
</button>