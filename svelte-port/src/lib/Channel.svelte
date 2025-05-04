<script lang="ts">
  import { BadgeCheck } from 'lucide-svelte';

  let { channel, clicked = $bindable() } = $props();

  const user: any = channel?.user || {};

  const avatar: string = user.profilePic || randomAvatar();
  const followers: number = channel?.followersCount || 0;
  const name: string = user.username || '';
  const verified: boolean = !!channel?.verified;
  //const slug: string = channel?.slug || '';

  function randomAvatar(): string {
    const AVATARS: number = 6;
    const n: number = Math.floor(Math.random() * AVATARS) + 1;
    return `/default_avatars/${n}.jpeg`;
  }
</script>

<button
  type="button"
  onclick={() => clicked = channel}
  class="outline flex flex-col items-center rounded-md gap-1">
  <img class="w-96 h-64 object-cover hover:outline" src={avatar} alt="Channel avatar"/>
  <span class="flex flex-row">
    <h1 class="text-2xl mt-1">{name}</h1>
    {#if verified}
    <BadgeCheck class="text-(--primary) ml-2 mt-2"/>
    {/if}
  </span>
  <h2 class="font-medium text-(--primary) mb-1">{followers} followers</h2>
</button>