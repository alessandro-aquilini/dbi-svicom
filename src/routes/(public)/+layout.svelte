<script lang="ts">
	let { children } = $props();
</script>

<!-- Public layout — no sidebar, no bottom nav -->
<div class="min-h-screen bg-background">
	{@render children()}
</div>
