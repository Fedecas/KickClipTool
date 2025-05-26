<script lang="ts">
  import { BadgeCheck } from 'lucide-svelte';

  import { blur } from 'svelte/transition';

  import type { ChannelObject, ChannelRef } from '$lib/types';
  import Spinner from '$lib/Spinner.svelte';

  interface Props {
    channel: ChannelObject,
    handleClick: (channel: ChannelRef) => Promise<void>
  }

  // Constants
  const AVATARS = 6;

  // Runes
  let { channel, handleClick }: Props = $props();
  let loadedImg = $state(false);

  // Internal
  const { slug, followers, name, avatar, verified } = channel;
  const validAvatar = avatar || randomAvatar();

  function randomAvatar(): string {
    const n = Math.floor(Math.random() * AVATARS) + 1;
    return `/default_avatars/${n}.jpeg`;
  }

  async function onClick(): Promise<void> {
    const ref: ChannelRef = { slug, name };
    await handleClick(ref);
  }
</script>

<button
  in:blur={{ duration: 700 }}
  type="button"
  onclick={onClick}
  class="flex flex-col group items-center rounded-sm gap-1 p-1
         bg-[#242428] inset-shadow-sm/100 shadow-sm/100
         hover:bg-gray-800 hover:inset-shadow-none hover:shadow-none">
  <div class="relative w-full h-64 bg-black/40">
    <img
      src={validAvatar}
      alt="{name} avatar"
      loading="lazy"
      onload={() => { loadedImg = true }}
      class="size-full object-cover rounded-sm brightness-70
              {loadedImg ? 'opacity-100' : 'opacity-0 drop-shadow-md/100'}
              transition-opacity duration-1000 ease-in
              group-hover:brightness-100 group-hover:drop-shadow-md/100"/>
    {#if !loadedImg}
    <div class="absolute w-[20%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </div>
    {/if}
  </div>
  <div class="w-full flex flex-row items-center justify-center gap-2">
    <h1 class="text-2xl mt-1 truncate">{name}</h1>
    {#if verified}
    <BadgeCheck class="size-6 text-(--primary) mt-1 flex-shrink-0"/>
    {/if}
  </div>
  <h2 class="font-medium text-(--primary) mb-1">{followers} followers</h2>
</button>