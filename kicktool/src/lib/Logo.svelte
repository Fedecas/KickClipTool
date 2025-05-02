<script lang="ts">
  const logoUrl: string = 'https://kick.com/img/kick-logo.svg';
  let { hasResults } = $props();
</script>

<img
  class="w-64 transition-all {hasResults ? 'mt-12' : 'mt-32'}"
  src={logoUrl}
  alt="Kick logo"
/>
<h1 class="text-3xl font-medium mb-2 transition-all {hasResults ? 'invisible' : ''}">
  Clip Tool
</h1>