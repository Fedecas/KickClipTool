<script lang="ts">
  import { BadgeCheck } from 'lucide-svelte';

  import { blur } from 'svelte/transition';
  import type { ChannelObject, ChannelRef } from '$lib/types';
  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    channel: ChannelObject,
    handleClick: (channel: ChannelRef) => void
  }

  // Runes
  let { channel, handleClick }: Props = $props();
  let loadedImg: boolean = $state(false);

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
  in:blur={{ duration: 700 }}
  type="button"
  onclick={() => handleClick({name, slug})}
  class="flex flex-col group items-center rounded-sm gap-1 p-1
         bg-[#242428] inset-shadow-sm/100 shadow-sm/100
         hover:bg-gray-800 hover:inset-shadow-none hover:shadow-none">
  <div class="relative w-full h-64">
    <img
      src={validAvatar}
      alt="{name} avatar"
      onload={() => {loadedImg = true}}
      class="size-full object-cover rounded-sm brightness-70
             group-hover:brightness-100 group-hover:drop-shadow-md/100"/>
    {#if !loadedImg}
    <div class="absolute w-[20%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </div>
    {/if}
  </div>
  <div class="flex flex-row">
    <h1 class="text-2xl mt-1">{name}</h1>
    {#if verified}
    <BadgeCheck class="text-(--primary) ml-2 mt-2"/>
    {/if}
  </div>
  <h2 class="font-medium text-(--primary) mb-1">{followers} followers</h2>
</button>