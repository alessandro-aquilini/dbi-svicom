<script lang="ts">
	import type { CalendarEvent } from './types';
	import CalendarDayCard from './CalendarDayCard.svelte';

	let { 
		currentDate, 
		events, 
		onEventClick 
	} = $props<{
		currentDate: Date;
		events: CalendarEvent[];
		onEventClick: (e: CalendarEvent) => void;
	}>();

	const filteredEvents = $derived.by(() => {
		return events
			.filter((e: CalendarEvent) => e.start.toDateString() === currentDate.toDateString())
			.sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime());
	});
</script>

<div class="flex-1 min-h-0 overflow-y-auto bg-slate-50/30 p-4 md:p-8">
	<div class="max-w-3xl mx-auto space-y-4 pb-12">
		{#if filteredEvents.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-slate-400">
				<div class="text-sm font-medium">Nessun evento per oggi</div>
			</div>
		{:else}
			{#each filteredEvents as event (event.id)}
				<CalendarDayCard {event} onclick={onEventClick} />
			{/each}
		{/if}
	</div>
</div>
