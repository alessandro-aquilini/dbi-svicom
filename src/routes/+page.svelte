<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Auto-redirect to login on root visit
	onMount(() => {
		goto('/login');
	});
</script>

<div class="flex h-screen items-center justify-center">
	<p class="text-muted-foreground">Reindirizzamento...</p>
</div>
