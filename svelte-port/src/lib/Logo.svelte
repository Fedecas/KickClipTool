<script lang="ts">
  let { hasResults } = $props();
</script>

<img
  class="w-64 transition-all {hasResults ? 'mt-12' : 'mt-32'}"
  src="/kick-logo.svg"
  alt="Kick logo"
/>
<h1 class="text-3xl font-medium mb-2 transition-all {hasResults ? 'invisible' : ''}">
  Clip Tool
</h1>