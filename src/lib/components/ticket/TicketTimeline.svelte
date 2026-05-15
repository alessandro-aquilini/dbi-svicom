<script lang="ts">
	import TimelineItem from './TimelineItem.svelte';
	import type { TicketTimelineItem } from './types';

	const {
		items,
		emptyLabel = 'Nessuna cronologia disponibile al momento.'
	}: {
		items: TicketTimelineItem[];
		emptyLabel?: string;
	} = $props();
</script>

{#if items.length === 0}
	<div class="rounded-lg border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
		{emptyLabel}
	</div>
{:else}
	<ol class="space-y-6">
		{#each items as item (item.id)}
			<TimelineItem {item} />
		{/each}
	</ol>
{/if}
