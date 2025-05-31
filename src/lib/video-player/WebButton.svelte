<script lang="ts">
  interface Props {
    web: string;
  }

  let { web }: Props = $props();
</script>

<a
  href={web}
  class="group"
  target="_blank"
  rel="noopener noreferrer">
  <button
    type="button"
    title="See on website"
    aria-label="See on website"
    class="bg-(--primary) rounded-sm p-2 transition duration-300 ease-in-out
            group-hover:bg-black group-hover:outline group-hover:scale-120">
    <img
      src="/kick-icon.ico"
      alt="Kick icon"
      class="size-8 group-hover:grayscale" />
  </button>
</a>