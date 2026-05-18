<script lang="ts">
	import type { CalendarEvent, EventType } from './types';
	import CalendarEventChip from './CalendarEventChip.svelte';
	import { formatTime } from './utils';
	import { EVENT_COLORS_DOT } from './types';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Location01Icon, Clock01Icon } from '@hugeicons/core-free-icons';

	let { 
		currentDate, 
		events, 
		onEventClick 
	} = $props<{
		currentDate: Date;
		events: CalendarEvent[];
		onEventClick: (e: CalendarEvent) => void;
	}>();

	const hours = Array.from({ length: 24 }, (_, i) => i);

	const filteredEvents = $derived.by(() => {
		return events
			.filter((e: CalendarEvent) => e.start.toDateString() === currentDate.toDateString())
			.sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime());
	});
</script>

<div class="flex-1 overflow-y-auto bg-slate-50/30 p-8">
	<div class="max-w-3xl mx-auto space-y-4">
		{#if filteredEvents.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-slate-400">
				<div class="text-sm font-medium">Nessun evento per oggi</div>
			</div>
		{:else}
			{#each filteredEvents as event (event.id)}
				<button
					onclick={() => onEventClick(event)}
					class="w-full text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group"
				>
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-2">
								<div class={`w-2 h-2 rounded-full ${EVENT_COLORS_DOT[event.type as EventType]}`}></div>
								<span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
									{event.type}
								</span>
							</div>
							<h3 class="text-lg font-bold text-slate-900 mb-4 group-hover:text-slate-700 transition-colors">
								{event.title}
							</h3>
							
							<div class="flex flex-wrap gap-6">
								<div class="flex items-center gap-2 text-slate-500">
									<HugeiconsIcon icon={Clock01Icon} size="16" class="text-slate-300" />
									<span class="text-sm font-medium">{formatTime(event.start)} — {formatTime(event.end)}</span>
								</div>
								<div class="flex items-center gap-2 text-slate-500">
									<HugeiconsIcon icon={Location01Icon} size="16" class="text-slate-300" />
									<span class="text-sm font-medium">{event.location}</span>
								</div>
							</div>
						</div>
						<div class="text-right shrink-0">
							<div class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Durata</div>
							<div class="text-sm font-bold text-slate-900">
								{Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))} min
							</div>
						</div>
					</div>
				</button>
			{/each}
		{/if}
	</div>
</div>
