<script lang="ts">
  import { fly } from "svelte/transition";

  interface Props {
    text: string;
  }

  const { text }: Props = $props();
</script>

<h1
  in:fly={{ y: -75, duration: 800 }}
  out:fly={{ y: -75, duration: 800 }}
  class="font-bold text-white/80 text-3xl mt-15"
>
  {text}
</h1>