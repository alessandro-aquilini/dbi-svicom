<!--
	EmptyState — Placeholder for empty lists/views.
	Usage: <EmptyState icon="📋" message="Nessuna pratica trovata." />
-->
<script lang="ts">
	let { icon = '📭', message = 'Nessun risultato.' }: { icon?: string; message?: string } = $props();
</script>

<div class="flex flex-col items-center justify-center py-12">
	<span class="text-4xl">{icon}</span>
	<p class="mt-3 text-sm text-muted-foreground">{message}</p>
</div>
